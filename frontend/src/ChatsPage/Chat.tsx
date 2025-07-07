import {
  redirect,
  useLoaderData,
  useParams,
  type LoaderFunctionArgs,
} from "react-router";
import ChatHeader from "./Chatheader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import type { MessageSchema } from "../types";
import {
  usePersonalSocket,
  useSendMessage,
} from "../features/hooks";
import useStore from "../store/personalZustand";
import { decryptMessage, getSharedKey } from "../features/functions";

export default function Chat() {
  const { chatId } = useParams();
  const initialMessages = useLoaderData();

  const [messages, setMessages] = useState<MessageSchema[]>([]);

  const [typed, setTyped] = useState("");
  const info = useAppSelector((state) => state.user);
  const personalSocket = usePersonalSocket(info.id, setMessages);
  personalSocket.joinRoom(chatId || "");
  const keyPairs = useStore((state) => state?.keyPairs);

  const [sharedKey, setSharedKey] = useState<CryptoKey>();

  const changeSharedKey = useStore((state) => state.changeSharedKey);

  useEffect(() => {
    async function decryptMessages() {
      if (initialMessages.length > 0 && sharedKey) {
        const decrypted = await Promise.all(
          initialMessages.map(async (message: MessageSchema) => {
            const newMessage = await decryptMessage(sharedKey, {
              iv: message.cipher.iv,
              data: message.cipher.data,
            });
            return { ...message, meta: newMessage };
          })
        );
        setMessages(decrypted);
      }
    }
    decryptMessages();
  }, [initialMessages, sharedKey]);

  const handleSendMessage = () => {
    if (typed === "") return;
    if (sharedKey) {
      useSendMessage(typed, chatId || "", info.id, sharedKey);
      personalSocket.sendMessage(chatId || "", typed, info.id);
    }
    setTyped("");
  };

  useEffect(() => {
    async function handle() {
      if (chatId && info && info.id && keyPairs) {
        const newSharedKey = await getSharedKey(
          chatId,
          info.id,
          keyPairs.privateKey
        );
        setSharedKey(newSharedKey);
        changeSharedKey(newSharedKey);
      }
    }
    handle();
  }, [chatId, info, keyPairs]);

  return (
    <section className="h-full flex flex-col flex-1 bg-[#1E1F22]">
      <ChatHeader id={chatId || ""} myId={info.id} />
      <main className="h-[calc(100%-110px)] w-[calc(100vw-290px)] flex flex-col justify-end px-[20px] pb-[20px] overflow-y-auto gap-[10px]">
        {messages
          ? messages.map((message, index) => {
              return (
                <MessageBubble
                  key={`${message.createdAt}-${message.meta}-${index}`}
                  message={message.meta}
                  place={message.senderId !== info.id ? "left" : "right"}
                />
              );
            })
          : null}
      </main>
      <ChatInput
        handleTyped={(value: string) => setTyped(value)}
        typed={typed}
        handleSendMessage={handleSendMessage}
      />
    </section>
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  const chatId = params.chatId;
  const response = await fetch("http://localhost:3000/get-chat-info", {
    method: "POST",
    body: JSON.stringify({ chatId }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) return redirect("/auth?mode=login");

  const { messages } = await response.json();

  return messages;
}
