import { useNavigate } from "react-router";
import type { MessageSchema } from "../types";
import React, { useEffect, useState } from "react";
import { socket } from "../socket";

export const useChatMessages = async (
  chatId: string
): Promise<MessageSchema[]> => {
  const navigate = useNavigate();
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
};

export const useSendMessage = async (
  typed: string,
  chatId: string,
  senderId: string,
  setTyped: (typed: string) => void
) => {
  if (typed.trim() === "") return;
  const response = await fetch("http://localhost:3000/send-message", {
    method: "POST",
    body: JSON.stringify({ chatId, meta: typed, senderId }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.log("something went wrong");
    return;
  }

  setTyped("");
};

type setMessages = React.Dispatch<React.SetStateAction<MessageSchema[]>>;
export const usePersonalSocket = (id: string, setMessages?: setMessages) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (id !== "") {
      if (!socket.connected) {
        socket.connect();
      }
      return () => {
        socket.disconnect();
      };
    }
  }, [id]);

  const sendMessage = (chatId: string, typed: string, senderId: string) => {
    socket.emit("chatMessage", { chatId, meta: typed, senderId });
  };

  const joinRoom = (chatId: string) => {
    if (!chatId) return;
    socket.emit("joinRoom", chatId);
  };

  useEffect(() => {
    const handler = (msg: MessageSchema) => {
      if (setMessages) setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on("chatMessage", handler);

    return () => {
      socket.off("chatMessage", handler);
    };
  });

  useEffect(() => {
    const handleStatuses = ({
      onlineUsersIds,
    }: {
      onlineUsersIds: string[];
    }) => {
      console.log(onlineUsersIds);
      setOnlineUsers(onlineUsersIds);
    };

    socket.on("onlineList", handleStatuses);

    return () => {
      socket.off("onlineList", handleStatuses);
    };
  }, []);

  return { sendMessage, joinRoom, onlineUsers };
};
