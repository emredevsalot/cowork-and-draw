"use client";
import React, { ReactNode, createContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import PartySocket from "partysocket";
import usePartySocket from "partysocket/react";

import { User } from "@/party/utils/auth";

const identify = async (socket: PartySocket) => {
  // the ./auth route will authenticate the connection to the partykit room
  const url = `${window.location.pathname}/auth?_pk=${socket._pk}`;
  const req = await fetch(url, { method: "POST" });

  if (!req.ok) {
    const res = await req.text();
    console.error("Failed to authenticate connection to PartyKit room", res);
  }
};

export type RoomSocketContextType = {
  socket: PartySocket;
  user: User | null;
};

// Create a context for the socket
export const RoomSocketContext = createContext<
  RoomSocketContextType | undefined
>(undefined);

export const RoomSocketProvider: React.FC<{
  host: string;
  party: string;
  room: string;
  user: User | null;
  children: ReactNode;
}> = ({ host, party, room, user: initialUser, children }) => {
  const session = useSession();
  const [user, setUser] = useState(initialUser);

  const socket = usePartySocket({
    host,
    party,
    room,
    onOpen(e) {
      // identify user upon connection
      if (session.status === "authenticated" && e.target) {
        identify(e.target as PartySocket);
        if (session?.data?.user) setUser(session.data.user as User);
      }
    },
  });

  // authenticate connection to the partykit room if session status changes
  useEffect(() => {
    if (
      session.status === "authenticated" &&
      socket?.readyState === socket.OPEN
    ) {
      identify(socket);
    }
  }, [session.status, socket]);

  return (
    <RoomSocketContext.Provider value={{ socket, user }}>
      {children}
    </RoomSocketContext.Provider>
  );
};

export default RoomSocketProvider;
