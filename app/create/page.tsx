import { redirect } from "next/navigation";

import { PARTYKIT_URL } from "@/app/env";

import CreateRoom from "./components/CreateRoom";
import { Canvas, CanvasType } from "../types";

export const revalidate = 0;

export default async function CreatePage() {
  async function createCanvas(formData: FormData) {
    "use server";

    const title = formData.get("title")?.toString() || "Anonymous Canvas";
    const slug = formData.get("slug")?.toString() || "slug";
    const rowCount = parseInt(formData.get("rowCount")?.toString() || "8");
    const columnCount = parseInt(
      formData.get("columnCount")?.toString() || "8"
    );

    const canvasTypeFromForm = formData.get("canvasType") as CanvasType | null;
    const canvasType: CanvasType = canvasTypeFromForm || "customCanvas";

    const canvas: Canvas = {
      title,
      slug,
      roomNumber: 1,
      rowCount,
      columnCount,
      canvasType,
      pixelsInfo: [],
      revealedPixels: 0,
      messages: [],
      isCompleted: false,
    };

    // Check if room already exists
    const response = await fetch(
      `${PARTYKIT_URL}/parties/canvasroom/${slug}-1`
    );
    if (response.status === 404) {
      // If the room doesn't exist, create it
      await fetch(`${PARTYKIT_URL}/parties/canvasroom/${slug}-1`, {
        method: "POST",
        body: JSON.stringify(canvas),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    redirect(`/rooms/${slug}-1`);
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
