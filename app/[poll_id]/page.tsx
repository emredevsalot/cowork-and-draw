import { notFound } from "next/navigation";
import { PARTYKIT_URL } from "@/app/env";
import type { Poll } from "@/app/types";
import PollUI from "@/components/PollUI";
import Balloon from "@/components/Balloon";

export default async function PollPage({
  params,
}: {
  params: { poll_id: string };
}) {
  const pollId = params.poll_id;

  // 🎈 TODO: send a GET request to the PartyKit room

  // 🎈 TODO: replace the mock data
  const poll = {
    title: "Mock poll question?",
    options: ["Mock option A", "Mock option B"],
    votes: [0, 0],
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">{poll.title}</h1>
        <PollUI id={pollId} options={poll.options} initialVotes={poll.votes} />
      </div>

      <Balloon float />
    </>
  );
}
