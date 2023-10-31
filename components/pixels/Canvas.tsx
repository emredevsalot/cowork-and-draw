"use client";
import { useState } from "react";
import Pixel from "./Pixel";

// This component represents a canvas with pixels to be revealed.
// It handles the reveal and reset actions.
function Canvas() {
  // Size of the canvas
  const [rowCount] = useState<number>(2);
  const [columnCount] = useState<number>(2);
  const totalPixels = rowCount * columnCount;

  const [revealedPixels, setRevealedPixels] = useState<number>(0);
  const [currentPixelIndex, setCurrentPixelIndex] = useState<number>(0);

  const handleRevealPixel = () => {
    if (currentPixelIndex < totalPixels) {
      setCurrentPixelIndex(currentPixelIndex + 1);
      setRevealedPixels(revealedPixels + 1);
    }
  };

  const handleReset = () => {
    setCurrentPixelIndex(0);
    setRevealedPixels(0);
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

export default Canvas;
