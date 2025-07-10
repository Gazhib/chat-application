import { useNavigate, useParams } from "react-router";
import ChatHeader from "./Chatheader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../store/hooks";
import type { MessageSchema } from "../types";
import { usePersonalSocket, useSendMessage } from "../features/hooks";
import useStore from "../store/personalZustand";
import { decryptMessage, getSharedKey } from "../features/functions";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../shared/LoadingSpinner";
type chatResponse = {
  initialMessages: MessageSchema[];
  user: {
    _id: string;
    login: string;
  };
};
export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const {
    data: { initialMessages, user } = {
      initialMessages: [],
      user: { _id: "", login: "" },
    },
    isLoading,
  } = useQuery({
    queryKey: [chatId],
    queryFn: async (): Promise<chatResponse> => {
      const chatResponse = await fetch("http://localhost:3000/get-chat-info", {
        method: "POST",
        body: JSON.stringify({ chatId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!chatResponse.ok) navigate("/auth?mode=login");

      const { chat, user } = await chatResponse.json();
      return { initialMessages: chat.messages, user };
    },
  });

  const [messages, setMessages] = useState<MessageSchema[]>([]);

  const [typed, setTyped] = useState("");
  const info = useAppSelector((state) => state.user);
  const personalSocket = usePersonalSocket(info.id, setMessages);
  personalSocket.joinRoom(chatId || "");
  const keyPairs = useStore((state) => state?.keyPairs);

  const [sharedKey, setSharedKey] = useState<CryptoKey>();

  const changeSharedKey = useStore((state) => state.changeSharedKey);

  useEffect(() => {
    setMessages([]);
    async function handle() {
      if (chatId && info && info.id && keyPairs) {
        const newSharedKey = await getSharedKey(
          chatId,
          info.id,
          keyPairs.privateKey
        );

        changeSharedKey(newSharedKey);
        setSharedKey(newSharedKey);
        async function decryptMessages() {
          console.log(user.login);
          if (initialMessages.length > 0 && newSharedKey) {
            const decrypted = await Promise.all(
              initialMessages.map(async (message: MessageSchema) => {
                try {
                  const newMessage = await decryptMessage(newSharedKey, {
                    iv: message.cipher.iv,
                    data: message.cipher.data,
                  });
                  return { ...message, meta: newMessage };
                } catch (e) {
                  console.log(e);
                }
              })
            );
            setMessages(decrypted as MessageSchema[]);
          }
        }
        decryptMessages();
      }
    }
    handle();
  }, [chatId, info, keyPairs, initialMessages && initialMessages.length]);

  const handleSendMessage = () => {
    if (typed === "") return;
    if (sharedKey) {
      useSendMessage(typed, chatId || "", info.id, sharedKey);
      personalSocket.sendMessage(chatId || "", typed, info.id);
    }
    setTyped("");
  };

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behaviour: "smooth" });
    }
  }, [messages]);

  return (
    <section className="h-screen flex flex-col bg-[#1E1F22]">
      <ChatHeader companionInfo={user} myId={info.id} />
      <main className="flex-1 w-[calc(100vw-290px)] min-h-0 max-h-[calc(100vh-110px)] flex flex-col px-[20px] py-[10px] pb-[20px] overflow-y-auto gap-[10px]">
        {!isLoading && messages ? (
          messages.map((message, index) => {
            if (!message) return;
            return (
              <MessageBubble
                key={`${message.createdAt}-${message.meta}-${index}`}
                message={message.meta}
                place={message.senderId !== info.id ? "left" : "right"}
              />
            );
          })
        ) : (
          <LoadingSpinner />
        )}
        <div ref={bottomRef} />
      </main>
      <ChatInput
        handleTyped={(value: string) => setTyped(value)}
        typed={typed}
        handleSendMessage={handleSendMessage}
      />
    </section>
  );
}
