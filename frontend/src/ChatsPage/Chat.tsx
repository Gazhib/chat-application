import { useNavigate, useParams } from "react-router";
import ChatHeader from "./Chatheader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useAppSelector } from "../store/hooks";

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [chatId],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/get-chat-info", {
        method: "POST",
        body: JSON.stringify({ chatId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        navigate("/chats");
      }

      const responseData = await response.json();
      return responseData.messages;
    },
  });

  useEffect(() => {
    if (!chatId) return;
    socket.emit("joinRoom", chatId);
  }, [chatId]);

  const [messages, setMessages] = useState(data ? data : []);

  useEffect(() => {
    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };



    socket.on("chatMessage", handler);

    return () => {
      socket.off("chatMessage", handler);
    };
  }, []);

  const [typed, setTyped] = useState("");
  const info = useAppSelector((state) => state.user);
  const handleSendMessage = async () => {
    const response = await fetch("http://localhost:3000/send-message", {
      method: "POST",
      body: JSON.stringify({ chatId, meta: typed, senderId: info.id }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    setTyped("");
    if (!response.ok) {
      console.log("something went wrong");
      return;
    }
    socket.emit("chatMessage", { chatId, meta: typed, senderId: info.id });
  };

  const handleTyped = (value: string) => {
    setTyped(value);
  };
  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <section className="h-full flex flex-col flex-1 bg-[#1E1F22]">
      <ChatHeader id={chatId || ""} myId={info.id} />
      <main className="h-[calc(100%-110px)] flex flex-col justify-end px-[20px] pb-[20px] overflow-y-auto gap-[10px]">
        {!isLoading && messages
          ? messages.map((message) => {
              return (
                <MessageBubble
                  key={message}
                  message={message.meta}
                  place={message.senderId === info.id ? "left" : "right"}
                />
              );
            })
          : null}
      </main>
      <ChatInput
        handleTyped={handleTyped}
        typed={typed}
        handleSendMessage={handleSendMessage}
      />
    </section>
  );
}
