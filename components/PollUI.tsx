"use client";

import { PARTYKIT_HOST } from "@/app/env";
import { Poll } from "@/app/types";
// 🎈 TODO: uncomment the import
// import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import PollOptions from "./PollOptions";

export default function PollUI({
  id,
  options,
  initialVotes,
}: {
  id: string;
  options: string[];
  initialVotes?: number[];
}) {
  const [votes, setVotes] = useState<number[]>(initialVotes ?? []);
  const [vote, setVote] = useState<number | null>(null);

  // 🎈 TODO: add usePartySocket hook

  const sendVote = (option: number) => {
    if (vote === null) {
      // 🎈 TODO: send message via WebSockets
      setVote(option);
    }
  };

  // prevent double voting
  useEffect(() => {
    let saved = localStorage?.getItem("poll:" + id);
    if (vote === null && saved !== null) {
      setVote(+saved);
    } else if (vote !== null && saved === null) {
      localStorage?.setItem("poll:" + id, `${vote}`);
    }
  }, [id, vote]);

  return (
    <PollOptions
      options={options}
      votes={votes}
      vote={vote}
      setVote={sendVote}
    />
  );
}
