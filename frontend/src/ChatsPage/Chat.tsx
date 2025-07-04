import { useParams } from "react-router";
import ChatHeader from "./Chatheader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAppSelector } from "../store/hooks";
import type { MessageSchema } from "../types";
import {
  useChatMessages,
  usePersonalSocket,
  useSendMessage,
} from "../features/hooks";

export default function Chat() {
  const { chatId } = useParams();

  const { data: initialMessages, isLoading: areMessagesLoading } = useQuery({
    queryKey: [chatId],
    queryFn: () => useChatMessages(chatId || ""),
  });

  const [messages, setMessages] = useState<MessageSchema[]>(
    initialMessages ? initialMessages : []
  );

  const [typed, setTyped] = useState("");
  const info = useAppSelector((state) => state.user);
  const personalSocket = usePersonalSocket(info.id, setMessages);
  personalSocket.joinRoom(chatId || "");

  
  const handleSendMessage = () => {
    useSendMessage(typed, chatId || "", info.id, setTyped);
    personalSocket.sendMessage(chatId || "", typed, info.id);
  };

  return (
    <section className="h-full flex flex-col flex-1 bg-[#1E1F22]">
      <ChatHeader id={chatId || ""} myId={info.id} />
      <main className="h-[calc(100%-110px)] flex flex-col justify-end px-[20px] pb-[20px] overflow-y-auto gap-[10px]">
        {!areMessagesLoading && messages
          ? messages.map((message, index) => {
              return (
                <MessageBubble
                  key={`${message.createdAt}-${message.meta}-${index}`}
                  message={message.meta}
                  place={message.senderId === info.id ? "left" : "right"}
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
