// import { generateSlug, RandomWordOptions } from "random-word-slugs";
import Link from "next/link";

import { PARTYKIT_URL } from "@/app/env";

import { RoomInfo, SINGLETON_ROOM_ID } from "@/party/canvasRooms";

import { RoomList } from "./components/RoomList";
import Button from "@/components/Button";

// const randomWords: RandomWordOptions<3> = {
//   format: "kebab",
//   categories: { noun: ["animals"] },
//   partsOfSpeech: ["adjective", "adjective", "noun"],
// };

const partyUrl = `${PARTYKIT_URL}/parties/canvasrooms/${SINGLETON_ROOM_ID}`;

export const revalidate = 0;

export default async function RoomListPage() {
  // fetch rooms for server rendering with a GET request to the server
  const res = await fetch(partyUrl, { next: { revalidate: 0 } });
  const rooms = ((await res.json()) ?? []) as RoomInfo[];

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h1 className="text-4xl font-medium">Rooms</h1>
        <Link href="/create">
          <Button>Create a room -&gt;</Button>
        </Link>
      </div>
      <RoomList initialRooms={rooms} />
    </div>
  );
}
