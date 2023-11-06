"use client";

import { useState } from "react";
import Input from "../Input";
import Button from "../Button";

export default function CanvasMaker() {
  const [title, setTitle] = useState("");
  const [rowCount, setRowCount] = useState("3");
  const [columnCount, setColumnCount] = useState("3");

  const canSubmit =
    title.length > 0 && rowCount.length > 0 && columnCount.length > 0;

  return (
    <>
      <Input
        placeholder="Canvas title"
        type="text"
        name="title"
        className={"text-2xl font-bold"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="rowCount">Row Count</label>
      <Input
        placeholder="Row count"
        type="number"
        name="rowCount"
        className={"text-xl font-bold"}
        value={rowCount}
        onChange={(e) => setRowCount(e.target.value)}
      />
      <label htmlFor="columnCount">Column Count</label>
      <Input
        placeholder="Column count"
        type="number"
        name="columnCount"
        className={"text-xl font-bold"}
        value={columnCount}
        onChange={(e) => setColumnCount(e.target.value)}
      />
      <Button type="submit" disabled={!canSubmit}>
        Create canvas
      </Button>
    </>
  );
}
