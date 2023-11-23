import type * as Party from "partykit/server";
import { nanoid } from "nanoid";
import { User, getNextAuthSession, isSessionValid } from "./utils/auth";
import { SINGLETON_ROOM_ID } from "./canvasRooms";
import { error, json, notFound, ok } from "./utils/response";
import { Canvas, PixelInfo } from "@/app/types";
import {
  ClearRoomMessage,
  Message,
  SyncMessage,
  editMessage,
  newMessage,
  systemMessage,
} from "./utils/message";

const DELETE_MESSAGES_AFTER_INACTIVITY_PERIOD = 1000 * 60 * 60 * 24; // 24 hours

type ChatConnectionState = { user?: User | null };

type ChatConnection = Party.Connection<ChatConnectionState>;

/**
 * This party manages the state and behaviour of an individual room
 */
export default class CanvasRoomServer implements Party.Server {
  canvas?: Canvas;
  constructor(public party: Party.Party) {}

  /** Retrieve canvas from room storage and store them on room instance */
  async ensureLoadCanvas() {
    if (!this.canvas) {
      this.canvas =
        (await this.party.storage.get<Canvas>("canvas")) ?? undefined;
    }
    return this.canvas;
  }

  /** Clear room storage */
  async removeRoomMessages() {
    if (this.canvas) {
      this.canvas.messages = [];
      this.saveCanvas();
    }
  }

  /** Remove this room from the room listing party */
  async removeRoomFromRoomList(id: string) {
    return this.party.context.parties.canvasrooms.get(SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id,
        action: "delete",
      }),
    });
  }

  /** Send room presence to the room listing party */
  async updateRoomList(action: "enter" | "leave", connection: ChatConnection) {
    return this.party.context.parties.canvasrooms.get(SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id: this.party.id,
        title: this.canvas?.title,
        roomNumber: this.canvas?.roomNumber,
        isCompleted: this.canvas?.isCompleted,
        connections: [...this.party.getConnections()].length,
        user: connection.state?.user,
        action,
      }),
    });
  }

  /** Send room completion to the room listing party */
  async updateCompletion(action: "completed") {
    return this.party.context.parties.canvasrooms.get(SINGLETON_ROOM_ID).fetch({
      method: "POST",
      body: JSON.stringify({
        id: this.party.id,
        isCompleted: this.canvas?.isCompleted,
        action,
      }),
    });
  }

  async authenticateUser(proxiedRequest: Party.Request) {
    // find the connection
    const id = new URL(proxiedRequest.url).searchParams.get("_pk");
    const connection = id && this.party.getConnection(id);
    if (!connection) {
      return error(`No connection with id ${id}`);
    }

    // authenticate the user
    const session = await getNextAuthSession(proxiedRequest);
    if (!session) {
      return error(`No session found`);
    }

    this.updateRoomList("enter", connection);

    connection.setState({ user: session });
    connection.send(
      newMessage({
        from: { id: "system" },
        text: `Welcome ${session.username}!`,
      })
    );
  }

  /**
   * Responds to HTTP requests to /parties/canvasroom/:room_id endpoint
   */
  async onRequest(request: Party.Request) {
    const canvas = await this.ensureLoadCanvas();

    // mark room as created by storing its id in object storage
    if (request.method === "POST") {
      // respond to authentication requests proxied through the app's
      // rewrite rules. See next.config.js in project root.
      if (new URL(request.url).pathname.endsWith("/auth")) {
        await this.authenticateUser(request);
        return ok();
      }

      // TODO[save]: I don't know if we need this here. (YEAH, if not it doesn't create the canvas)
      const canvas = (await request.json()) as Canvas;
      this.canvas = { ...canvas };
      this.saveCanvas();

      return ok();
    }

    if (request.method === "GET") {
      // TODO: Can we do this in "onConnect"?
      if (this.canvas) {
        return new Response(JSON.stringify(this.canvas), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // return list of messages for server rendering pages
      if (await this.party.storage.get("canvas")) {
        if (canvas?.messages) {
          return json<SyncMessage>({
            type: "sync",
            messages: canvas?.messages,
          });
        }
      }
      return notFound();
    }

    // clear room history
    if (request.method === "DELETE") {
      await this.removeRoomMessages();
      this.party.broadcast(JSON.stringify(<ClearRoomMessage>{ type: "clear" }));
      this.party.broadcast(
        newMessage({
          from: { id: "system" },
          text: `Room history cleared`,
        })
      );
      return ok();
    }

    if (request.method === "OPTIONS") {
      return ok();
    }

    return notFound();
  }

  /**
   * Executes when a new WebSocket connection is made to the room
   */
  async onConnect(connection: ChatConnection) {
    await this.ensureLoadCanvas();
    // TODO: It works when these are commented out? What do they do? Are they necessary?
    // connection.send(JSON.stringify(this.canvas));
    // send the whole list of messages to user when they connect
    // connection.send(syncMessage(this.canvas?.messages ?? []));

    // keep track of connections
    this.updateRoomList("enter", connection);
  }

  async onMessage(
    messageString: string,
    connection: Party.Connection<{ user: User | null }>
  ) {
    if (!this.canvas) return;

    const message = JSON.parse(messageString);

    if (message.type === "reveal") {
      this.canvas.revealedPixels += 1;

      const payload = <PixelInfo>{
        i: message.i,
        j: message.j,
        color: message.color,
      };

      // If placed pixel was the last pixel, mark canvas as completed
      if (
        this.canvas.revealedPixels >=
        this.canvas.rowCount * this.canvas.columnCount
      ) {
        this.canvas.isCompleted = true;
        this.updateCompletion("completed");
      }

      this.canvas.pixelsInfo.push(payload);
      this.party.broadcast(JSON.stringify(this.canvas));
    } else if (message.type === "reset") {
      this.canvas.revealedPixels = 0;
      this.canvas.pixelsInfo = [];
      this.party.broadcast(JSON.stringify(this.canvas));
    } else if (message.type === "new" || message.type === "edit") {
      const user = connection.state?.user;
      if (!isSessionValid(user)) {
        return connection.send(
          systemMessage("You must sign in to send messages to this room")
        );
      }
      if (message.text.length > 1000) {
        return connection.send(systemMessage("Message too long"));
      }

      const payload = <Message>{
        id: message.id ?? nanoid(),
        from: { id: user.username, image: user.image },
        text: message.text,
        at: Date.now(),
      };

      // send new message to all connections
      if (message.type === "new") {
        this.party.broadcast(newMessage(payload));
        this.canvas.messages.push(payload);
      }

      // send edited message to all connections
      if (message.type === "edit") {
        this.party.broadcast(editMessage(payload), []);
        this.canvas.messages = this.canvas.messages!.map((m) =>
          m.id == message.id ? payload : m
        );
      }

      // automatically clear the room storage after period of inactivity
      await this.party.storage.deleteAlarm();
      await this.party.storage.setAlarm(
        new Date().getTime() + DELETE_MESSAGES_AFTER_INACTIVITY_PERIOD
      );
    }
    this.saveCanvas();
  }

  async onClose(connection: Party.Connection) {
    this.updateRoomList("leave", connection);
    // TODO: Use to delete rooms on connection close
    // await this.removeRoomFromRoomList(this.party.id);
    // await this.party.storage.deleteAll();
  }

  async onStart() {
    this.canvas = await this.party.storage.get<Canvas>("canvas");
  }

  async saveCanvas() {
    if (this.canvas) {
      await this.party.storage.put<Canvas>("canvas", this.canvas);
    }
  }

  //   /**
  //    * A scheduled job that executes when the room storage alarm is triggered
  //    */
  //   async onAlarm() {
  //     // alarms don't have access to room id, so retrieve it from storage
  //     const id = await this.party.storage.get<string>("id");
  //     if (id) {
  //       await this.removeRoomMessages();
  //       await this.removeRoomFromRoomList(id);
  //     }
  //   }
}

CanvasRoomServer satisfies Party.Worker;
