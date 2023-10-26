import type * as Party from "partykit/server";
import type { Poll } from "@/app/types";

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}

  poll: Poll | undefined;

  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const poll = (await req.json()) as Poll;
      this.poll = { ...poll, votes: poll.options.map(() => 0) };
    }

    if (this.poll) {
      return new Response(JSON.stringify(this.poll), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async onMessage(message: string) {
    if (!this.poll) return;

    const event = JSON.parse(message);
    if (event.type === "vote") {
      this.poll.votes![event.option] += 1;
      this.party.broadcast(JSON.stringify(this.poll));
    }
  }
}

Server satisfies Party.Worker;
