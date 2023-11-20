"use client";

import { useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";

export default function CreateRoom() {
  const [title, setTitle] = useState("");
  const [rowCount, setRowCount] = useState("3");
  const [columnCount, setColumnCount] = useState("3");
  const [canvasType, setCanvasType] = useState("customCanvas");

  const canSubmit =
    title.length > 0 && rowCount.length > 0 && columnCount.length > 0;

  return (
    <>
      <Input
        placeholder="Room name"
        type="text"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="rowCount">Row Count</label>
      <Input
        placeholder="Row count"
        type="number"
        id="rowCount"
        name="rowCount"
        value={rowCount}
        onChange={(e) => setRowCount(e.target.value)}
      />
      <label htmlFor="columnCount">Column Count</label>
      <Input
        placeholder="Column count"
        type="number"
        id="columnCount"
        name="columnCount"
        value={columnCount}
        onChange={(e) => setColumnCount(e.target.value)}
      />
      <label htmlFor="canvasType">Canvas Type</label>
      <select
        className="w-full rounded-lg border border-gray-200 placeholder-gray-400 p-2"
        id="canvasType"
        name="canvasType"
        value={canvasType}
        onChange={(e) => setCanvasType(e.target.value)}
      >
        <option value="customCanvas">
          Custom Canvas (After every pomodoro session, choose a color and place
          a pixel.)
        </option>
        <option value="greenCanvas">
          Green Canvas (After every pomodoro session, reveal the next green
          pixel.)
        </option>
      </select>
      <Button type="submit" disabled={!canSubmit}>
        Create room
      </Button>
    </>
  );
}
