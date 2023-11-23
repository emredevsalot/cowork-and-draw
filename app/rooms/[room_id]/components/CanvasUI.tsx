"use client";

import { useContext, useEffect, useState } from "react";
import { CirclePicker } from "react-color";
import { useLocalData } from "@/components/Providers";
import { Canvas, CanvasType, ILocalData, PixelInfo } from "@/app/types";
import { RoomSocketContext, RoomSocketContextType } from "./RoomSocketProvider";
import Pixel from "@/components/room/Pixel";
import ConnectionStatus from "@/components/ConnectionStatus";
import Button from "@/components/Button";

// This component represents a canvas with pixels to be revealed.
// It handles the reveal and reset actions.
export const CanvasUI: React.FC<{
  rowCount: number;
  columnCount: number;
  canvasType: CanvasType;
  initialPixelsInfo: PixelInfo[];
  initialRevealedPixels: number;
  createNextCanvas: () => Promise<void>;
}> = ({
  rowCount,
  columnCount,
  canvasType,
  initialPixelsInfo,
  initialRevealedPixels,
  createNextCanvas,
}) => {
  const { storageValues, setStorageValues, storageValuesLoaded } =
    useLocalData();

  // Canvas data
  const totalPixels = rowCount * columnCount;
  const [revealedPixels, setRevealedPixels] = useState<number>(
    initialRevealedPixels
  );
  const [pixelsInfo, setPixelsInfo] = useState<PixelInfo[]>(initialPixelsInfo);

  const [selectedColor, setSelectedColor] = useState("#f44336");

  const { socket, user } = useContext(
    RoomSocketContext
  ) as RoomSocketContextType;
  // if (!socket) return;

  useEffect(() => {
    function onMessageListener(event: MessageEvent<string>) {
      const message = JSON.parse(event.data) as Canvas;
      if (typeof message.revealedPixels === "number") {
        setRevealedPixels(message.revealedPixels);
        setPixelsInfo(message.pixelsInfo);
      }
    }
    socket.addEventListener("message", onMessageListener);
    return () => {
      socket.removeEventListener("message", onMessageListener);
    };
  }, [socket]);

  const handleRevealPixel = (i: number, j: number, color: string) => {
    if (
      revealedPixels < totalPixels &&
      storageValues.availablePixelAmount > 0
    ) {
      socket.send(JSON.stringify({ type: "reveal", i, j, color }));

      const updatedStorageValues: ILocalData = {
        ...storageValues,
        availablePixelAmount: storageValues.availablePixelAmount - 1,
      };
      setStorageValues(updatedStorageValues);
    }
  };

  // Tabula rasa function - cleaning the canvas
  const handleReset = () => {
    socket.send(JSON.stringify({ type: "reset" }));
  };

  // We use ">=" just to be safe, if somehow "revealedPixels" increase by 2 at the last increase.
  const isAllRevealed = revealedPixels >= totalPixels;

  // Function to find the specific pixel color based on i and j values
  // If it's not added yet, return "#ffffff"
  const findPixelColor = (targetI: number, targetJ: number): string => {
    const foundPixel = pixelsInfo.find(
      (pixel) => pixel.i === targetI && pixel.j === targetJ
    );
    return foundPixel ? foundPixel.color : "#ffffff";
  };

  // Generate pixels
  const pixels = [];
  for (let i = 0; i < rowCount; i++) {
    const row = [];
    for (let j = 0; j < columnCount; j++) {
      row.push(
        <div>
          {/* Pixels for green canvas */}
          {canvasType === "greenCanvas" && (
            <Pixel key={`${i}_${j}`} selectedColor={findPixelColor(i, j)} />
          )}
          {/* Pixels for custom canvas */}
          {canvasType === "customCanvas" &&
            // Clickable pixel
            (findPixelColor(i, j) == "#ffffff" ? (
              <div style={{ backgroundColor: selectedColor }}>
                <div
                  className={
                    storageValues?.availablePixelAmount > 0
                      ? "cursor-pointer hover:scale-75"
                      : ""
                  }
                  onClick={() => handleRevealPixel(i, j, selectedColor)}
                >
                  <Pixel
                    key={`${i}_${j}`}
                    selectedColor={findPixelColor(i, j)}
                  />
                </div>
              </div>
            ) : (
              // Non clickable pixel
              <Pixel key={`${i}_${j}`} selectedColor={findPixelColor(i, j)} />
            ))}
        </div>
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
      {canvasType === "greenCanvas" ? (
        <>
          {pixels}
          <br />
          <Button
            onClick={() =>
              handleRevealPixel(
                Math.floor(revealedPixels / columnCount),
                revealedPixels % columnCount,
                "#00ce4b"
              )
            }
            disabled={isAllRevealed || storageValues?.availablePixelAmount == 0}
          >
            {"Reveal next (" + storageValues?.availablePixelAmount + ")"}
          </Button>
          {isAllRevealed && (
            <div className="flex flex-col items-center mt-4 gap-4">
              <form action={createNextCanvas}>
                <Button type="submit">Next Canvas</Button>
              </form>
            </div>
          )}
          <ConnectionStatus socket={socket} />
        </>
      ) : canvasType === "customCanvas" ? (
        <>
          {pixels}
          <br />
          <p className="mb-4">
            Available pixels: {storageValues?.availablePixelAmount}
          </p>
          <CirclePicker
            color={selectedColor}
            onChangeComplete={(color) => setSelectedColor(color.hex)}
          />
          {isAllRevealed && (
            <div className="flex flex-col items-center mt-4 gap-4">
              <form action={createNextCanvas}>
                <Button type="submit">Next Canvas</Button>
              </form>
            </div>
          )}
          <ConnectionStatus socket={socket} />
        </>
      ) : (
        <>Invalid Canvas Type</>
      )}
    </div>
  );
};

export default CanvasUI;
