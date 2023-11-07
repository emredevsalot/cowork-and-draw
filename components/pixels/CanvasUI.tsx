"use client";

import { useState } from "react";
import usePartySocket from "partysocket/react";
import { PARTYKIT_HOST } from "@/app/env";
import { useLocalData } from "@/app/providers/LocalProvider";
import { Canvas, ILocalData } from "@/app/types";
import Pixel from "./Pixel";
import Button from "../Button";
import ConnectionStatus from "../ConnectionStatus";

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
  const { storageValues, setStorageValues, storageValuesLoaded } =
    useLocalData();

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
    if (
      revealedPixels < totalPixels &&
      storageValues.availablePixelAmount > 0
    ) {
      socket.send(JSON.stringify({ type: "reveal" }));

      const updatedStorageValues: ILocalData = {
        ...storageValues,
        availablePixelAmount: storageValues.availablePixelAmount - 1,
      };
      setStorageValues(updatedStorageValues);
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

  if (!storageValuesLoaded) {
    return <div className=" flex justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <ConnectionStatus socket={socket} />
      {pixels}
      <br />
      <Button
        onClick={handleRevealPixel}
        disabled={isAllRevealed || storageValues?.availablePixelAmount == 0}
      >
        {"Reveal (" + storageValues?.availablePixelAmount + ")"}
      </Button>
      {isAllRevealed && (
        <div className="flex flex-col items-center mt-4 gap-4">
          <div>Done.</div>
          <Button onClick={handleReset}>Reset Canvas</Button>
        </div>
      )}
    </div>
  );
}

export default CanvasUI;
