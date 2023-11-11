"use client";
import { ChatMessage, Message } from "@/party/utils/message";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, {
  FormEventHandler,
  useContext,
  useEffect,
  useState,
} from "react";
import { RoomSocketContext, RoomSocketContextType } from "./RoomSocketProvider";
import RoomMessage from "./RoomMessage";

export const ChatUI: React.FC<{
  messages: Message[];
}> = ({ messages: initialMessages }) => {
  const session = useSession();
  const [messages, setMessages] = useState(initialMessages);
  const { socket, user } = useContext(
    RoomSocketContext
  ) as RoomSocketContextType;
  // if (!socket) return;

  useEffect(() => {
    function onMessageListener(event: MessageEvent<string>) {
      const message = JSON.parse(event.data) as ChatMessage;
      if (message.type === "sync") {
        setMessages(message.messages);
      }
      // after that, the server will send updates as they arrive
      if (message.type === "new") setMessages((prev) => [...prev, message]);
      if (message.type === "clear") setMessages([]);
      if (message.type === "edit") {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      }
    }
    socket.addEventListener("message", onMessageListener);
    scrollToBottom();
    return () => {
      socket.removeEventListener("message", onMessageListener);
    };
  }, [socket]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const text = event.currentTarget.message.value;
    if (text?.trim()) {
      socket.send(JSON.stringify({ type: "new", text }));
      event.currentTarget.message.value = "";
      scrollToBottom();
    }
  };

  function scrollToBottom() {
    const chatContainer = document.querySelector(".chat-container");
    if (chatContainer) {
      // TODO: Delay the scroll to ensure it happens after the new message is added
      // There should be a better way to handle this.
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 200); // You can adjust the delay as needed
    }
  }

  return (
    <>
      <div className="chat-container h-96 overflow-auto w-full flex flex-col pt-8 px-4 md:rounded-xl md:shadow-md bg-white gap-6">
        {messages.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {messages.map((message) => (
              <RoomMessage
                key={message.id}
                message={message}
                isMe={message.from.id === user?.username}
              />
            ))}
          </ul>
        ) : (
          <p className="italic">No messages yet</p>
        )}
        {session.status === "authenticated" ? (
          <form onSubmit={handleSubmit} className="sticky bottom-0">
            <input
              placeholder="Send message..."
              className="border border-stone-400 p-3 bg-stone-100 min-w-full rounded"
              type="text"
              name="message"
            ></input>
          </form>
        ) : session.status === "unauthenticated" ? (
          <div className="sticky left-4 sm:left-6 bottom-0 pt-2 rounded-sm flex items-start">
            <p className="bg-red-100 p-3">
              You must be signed in to post messages.{" "}
              <Link
                className="underline"
                href={`/api/auth/signin?callbackUrl=${window.location.href}`}
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <span />
        )}
      </div>
    </>
  );
};

export default ChatUI;
