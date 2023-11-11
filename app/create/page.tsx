import { redirect } from "next/navigation";

import { PARTYKIT_URL } from "@/app/env";

import CreateRoom from "./components/CreateRoom";
import { Canvas } from "../types";

const randomId = () => Math.random().toString(36).substring(2, 10);

export const revalidate = 0;

export default async function CreatePage() {
  async function createCanvas(formData: FormData) {
    "use server";

    const title = formData.get("title")?.toString() || "Anonymous Canvas";
    const rowCount = parseInt(formData.get("rowCount")?.toString() || "3");
    const columnCount = parseInt(
      formData.get("columnCount")?.toString() || "3"
    );

    const id = randomId();
    const canvas: Canvas = {
      title,
      rowCount,
      columnCount,
      revealedPixels: 0,
      messages: [],
    };

    await fetch(`${PARTYKIT_URL}/parties/canvasroom/${id}`, {
      method: "POST",
      body: JSON.stringify(canvas),
      headers: {
        "Content-Type": "application/json",
      },
    });

    redirect(`/rooms/${id}`);
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-4xl font-medium">Create a room</h1>
      <form action={createCanvas}>
        <div className="flex flex-col space-y-4">
          <CreateRoom />
        </div>
      </form>
    </div>
  );
}
