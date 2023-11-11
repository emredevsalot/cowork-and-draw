"use client";
import React, { useEffect, useState } from "react";

type Props = {
  rowId: number;
  columnId: number;
  columnCount: number;
  revealedPixels: number;
};

// This component represents an individual pixel within the canvas.
// It changes color when revealed.
const Pixel = ({ rowId, columnId, columnCount, revealedPixels }: Props) => {
  const uniqueId = rowId * columnCount + columnId;
  const isRevealed = uniqueId < revealedPixels;
  const [pixelColor, setPixelColor] = useState("bg-white");

  useEffect(() => {
    if (isRevealed) {
      setPixelColor("bg-green-500");
    } else {
      setPixelColor("bg-white");
    }
  }, [isRevealed]);

  return (
    <div
      className={`w-10 h-10 ${pixelColor} border flex justify-center items-center`}
    >
      {/* {uniqueId} */}
    </div>
  );
};

export default Pixel;