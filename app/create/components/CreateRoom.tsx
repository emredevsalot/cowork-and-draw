"use client";

import { useState, useEffect } from "react";

import slugify from "slugify";

import Button from "@/components/Button";
import Input from "@/components/Input";

export default function CreateRoom() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [rowCount, setRowCount] = useState("3");
  const [columnCount, setColumnCount] = useState("3");
  const [canvasType, setCanvasType] = useState("customCanvas");

  const canSubmit =
    title.length > 0 &&
    slug.length > 0 &&
    rowCount.length > 0 &&
    columnCount.length > 0;

  // Generating room slug
  // according to title, row and column counts
  useEffect(() => {
    const titleSlug = slugify(title, {
      lower: true,
      strict: true,
    });
    setSlug(`${titleSlug}-${rowCount}x${columnCount}`);
  }, [title, rowCount, columnCount]);

  return (
    <>
      <Input
        placeholder="Room name"
        type="text"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="slug">Slug</label>
      <Input
        placeholder="slug"
        type="text"
        name="slug"
        id="slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <label htmlFor="rowCount">Row Count</label>
      <select
        className="w-full rounded-lg border border-gray-200 placeholder-gray-400 p-2"
        id="rowCount"
        name="rowCount"
        value={rowCount}
        onChange={(e) => setRowCount(e.target.value)}
      >
        <option value="3">3</option>
        <option value="6">6</option>
        <option value="9">9</option>
        <option value="12">12</option>
      </select>
      <label htmlFor="columnCount">Column Count</label>
      <select
        className="w-full rounded-lg border border-gray-200 placeholder-gray-400 p-2"
        id="columnCount"
        name="columnCount"
        value={columnCount}
        onChange={(e) => setColumnCount(e.target.value)}
      >
        <option value="3">3</option>
        <option value="6">6</option>
        <option value="9">9</option>
        <option value="12">12</option>
      </select>
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
