import { PARTYKIT_HOST, PARTYKIT_URL } from "@/app/env";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Canvas } from "@/app/types";
import Link from "next/link";
import Timer from "./components/Timer";
import { User } from "@/party/utils/auth";
import { getServerSession } from "next-auth";
import PresenceBar from "./components/PresenceBar";
import CanvasUI from "./components/CanvasUI";
import ChatUI from "./components/ChatUI";
import RoomSocketProvider from "./components/RoomSocketProvider";
import ClearRoomButton from "./components/ClearRoomButton";

const party = "canvasroom";

export default async function RoomPage({
  params,
}: {
  params: { room_id: string };
}) {
  const url = `${PARTYKIT_URL}/parties/${party}/${params.room_id}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const canvas = res.status === 404 ? null : ((await res.json()) as Canvas);

  // fetch user session for server rendering
  const session = await getServerSession(authOptions);
  const user = session?.user as User | null;

  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-wrap justify-start items-center gap-4 mb-4">
        <Link href="/rooms" className="text-stone-400 whitespace-nowrap">
          &lt;- All Rooms
        </Link>
        <ClearRoomButton roomId={params.room_id} />
      </div>
      {canvas ? (
        <>
          <RoomSocketProvider
            host={PARTYKIT_HOST}
            party={party}
            room={params.room_id}
            user={user}
          >
            <h1 className="text-2xl font-bold">{canvas.title}</h1>
            <div className="flex flex-col gap-8 py-12 md:flex-row w-full flex-grow">
              <div className="flex flex-col gap-4 py-8 md:py-20 bg-white w-full items-center justify-center md:rounded-xl md:shadow-md">
                <Timer />
                <PresenceBar roomId={params.room_id} />
              </div>
              <div className="w-full flex justify-center items-center">
                <CanvasUI
                  rowCount={canvas.rowCount}
                  columnCount={canvas.columnCount}
                  initialRevealedPixels={canvas.revealedPixels}
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-12">Chat</h2>
            <ChatUI messages={canvas.messages ?? []} />
          </RoomSocketProvider>
        </>
      ) : (
        <h1 className="text-4xl font-medium">Room not found</h1>
      )}
    </div>
  );
}
