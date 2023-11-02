import { redirect } from "next/navigation";
import { PARTYKIT_URL } from "./env";
import type { Canvas } from "./types";
import CanvasMaker from "@/components/pixels/CanvasMaker";

const randomId = () => Math.random().toString(36).substring(2, 10);

export default function Home() {
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
    };

    await fetch(`${PARTYKIT_URL}/party/${id}`, {
      method: "POST",
      body: JSON.stringify(canvas),
      headers: {
        "Content-Type": "application/json",
      },
    });

    redirect(`/${id}`);
  }
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Pixels</h1>
      <form action={createCanvas}>
        <div className="flex flex-col space-y-6">
          <CanvasMaker />
        </div>
      </form>
    </div>
  );
}
