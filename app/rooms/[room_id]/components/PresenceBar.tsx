"use client";

import { useState } from "react";
import usePartySocket from "partysocket/react";
import { RoomInfo, SINGLETON_ROOM_ID } from "@/party/canvasRooms";
import { PARTYKIT_HOST } from "@/app/env";
import Avatar from "@/components/Avatar";

export const PresenceBar: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [room, setRoom] = useState<RoomInfo | null>(null);

  usePartySocket({
    host: PARTYKIT_HOST,
    party: "canvasrooms",
    room: SINGLETON_ROOM_ID,
    onMessage(event: MessageEvent<string>) {
      const rooms = JSON.parse(event.data) as RoomInfo[];
      const room = rooms.find((room) => room.id === roomId);
      setRoom(room ?? null);
    },
  });

  if (!room) return;

  return (
    <div className="flex flex-reverse row -space-x-2">
      <span className="bg-stone-100 text-stone-600 rounded-full px-2 py-1 mr-4">
        {room.connections}
        <span> coworker{room.connections !== 1 && "s"} in the room</span>
      </span>
      {room.users.map((user) => (
        <Avatar
          key={user.username}
          username={user.username}
          image={user.image ?? null}
        />
      ))}
    </div>
  );
};

export default PresenceBar;
