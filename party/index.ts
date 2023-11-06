import type * as Party from "partykit/server";
import type { Canvas } from "@/app/types";

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}

  canvas: Canvas | undefined;

  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const canvas = (await req.json()) as Canvas;
      this.canvas = { ...canvas };
      this.saveCanvas();
    }

    if (this.canvas) {
      return new Response(JSON.stringify(this.canvas), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async onMessage(message: string) {
    if (!this.canvas) return;

    const event = JSON.parse(message);
    if (event.type === "reveal") {
      this.canvas.revealedPixels += 1;
      this.party.broadcast(JSON.stringify(this.canvas));
      this.saveCanvas();
    } else if (event.type === "reset") {
      this.canvas.revealedPixels = 0;
      this.party.broadcast(JSON.stringify(this.canvas));
      this.saveCanvas();
    }
  }

  async saveCanvas() {
    if (this.canvas) {
      await this.party.storage.put<Canvas>("canvas", this.canvas);
    }
  }

  async onStart() {
    this.canvas = await this.party.storage.get<Canvas>("canvas");
  }
}

Server satisfies Party.Worker;
