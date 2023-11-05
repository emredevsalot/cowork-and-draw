import { notFound } from "next/navigation";
import { PARTYKIT_URL } from "@/app/env";
import type { Canvas } from "@/app/types";
import CanvasUI from "@/components/pixels/CanvasUI";
import Timer from "@/components/Timer";

export default async function PixelsPage({
  params,
}: {
  params: { canvas_id: string };
}) {
  const canvasId = params.canvas_id;

  const req = await fetch(`${PARTYKIT_URL}/party/${canvasId}`, {
    method: "GET",
    next: {
      revalidate: 0,
    },
  });

  if (!req.ok) {
    if (req.status === 404) {
      notFound();
    } else {
      throw new Error("Something went wrong.");
    }
  }

  // Get the canvas data from request
  const canvas = (await req.json()) as Canvas;

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Pixels - {canvas.title}</h1>
      <div className="flex w-full flex-grow">
        <div className="w-full">
          <Timer />
        </div>
        <div className="w-full">
          <CanvasUI
            id={canvasId}
            rowCount={canvas.rowCount}
            columnCount={canvas.columnCount}
            initialRevealedPixels={canvas.revealedPixels}
          />
        </div>
      </div>
    </div>
  );
}
