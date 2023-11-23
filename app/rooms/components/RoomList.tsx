"use client";
import { useState } from "react";

import usePartySocket from "partysocket/react";
import { RoomInfo, SINGLETON_ROOM_ID } from "@/party/canvasRooms";

import ConnectionStatus from "@/components/ConnectionStatus";
import { PARTYKIT_HOST } from "@/app/env";

import RoomCard from "./RoomCard";

export const RoomList: React.FC<{ initialRooms: RoomInfo[] }> = ({
  initialRooms,
}) => {
  // render with initial data, update from websocket as messages arrive
  const [rooms, setRooms] = useState(initialRooms);

  // open a websocket connection to the server
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    party: "canvasrooms",
    room: SINGLETON_ROOM_ID,
    onMessage(event: MessageEvent<string>) {
      setRooms(JSON.parse(event.data) as RoomInfo[]);
    },
  });

  const completedRooms = rooms.filter((room) => room.isCompleted);
  const ongoingRooms = rooms.filter((room) => !room.isCompleted);

  return (
    <>
      <h2 className="text-2xl">Ongoing Rooms</h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ongoingRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </ul>

      <h2 className="text-2xl">Completed Rooms</h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {completedRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </ul>
      <ConnectionStatus socket={socket} />
    </>
  );
};
