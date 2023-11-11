"use client";

import { useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";

export default function CreateRoom() {
  const [title, setTitle] = useState("");
  const [rowCount, setRowCount] = useState("3");
  const [columnCount, setColumnCount] = useState("3");

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
        name="rowCount"
        value={rowCount}
        onChange={(e) => setRowCount(e.target.value)}
      />
      <label htmlFor="columnCount">Column Count</label>
      <Input
        placeholder="Column count"
        type="number"
        name="columnCount"
        value={columnCount}
        onChange={(e) => setColumnCount(e.target.value)}
      />
      <Button type="submit" disabled={!canSubmit}>
        Create room
      </Button>
    </>
  );
}
