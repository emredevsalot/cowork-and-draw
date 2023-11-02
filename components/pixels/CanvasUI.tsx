"use client";

import { useState } from "react";
import usePartySocket from "partysocket/react";
import { PARTYKIT_HOST } from "@/app/env";
import { Canvas } from "@/app/types";
import Pixel from "./Pixel";

// This component represents a canvas with pixels to be revealed.
// It handles the reveal and reset actions.
function CanvasUI({
  id,
  rowCount,
  columnCount,
  initialRevealedPixels,
}: {
  id: string;
  rowCount: number;
  columnCount: number;
  initialRevealedPixels: number;
}) {
  // Size of the canvas
  const totalPixels = rowCount * columnCount;
  const [revealedPixels, setRevealedPixels] = useState<number>(
    initialRevealedPixels
  );

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: id,
    onMessage(event) {
      const message = JSON.parse(event.data) as Canvas;
      if (typeof message.revealedPixels === "number") {
        setRevealedPixels(message.revealedPixels);
      }
    },
  });

  const handleRevealPixel = () => {
    if (revealedPixels < totalPixels) {
      socket.send(JSON.stringify({ type: "reveal" }));
    }
  };

  const handleReset = () => {
    socket.send(JSON.stringify({ type: "reset" }));
  };

  const isAllRevealed = revealedPixels === totalPixels;

  // Generate pixels
  const pixels = [];
  for (let i = 0; i < rowCount; i++) {
    const row = [];
    for (let j = 0; j < columnCount; j++) {
      row.push(
        <Pixel
          key={`${i}_${j}`}
          rowId={i}
          columnId={j}
          columnCount={columnCount}
          revealedPixels={revealedPixels}
        />
      );
    }
    pixels.push(
      <div className={`flex row_${i}`} key={"row_" + i}>
        {row}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {pixels}
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
        onClick={handleRevealPixel}
        disabled={isAllRevealed}
      >
        Reveal
      </button>
      {isAllRevealed && (
        <div className="flex items-center mt-4 gap-4">
          <div>Done.</div>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default CanvasUI;
