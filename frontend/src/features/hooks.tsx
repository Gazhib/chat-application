import type { MessageSchema } from "../types";
import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import { decryptMessage, encryptMessage } from "./functions";
import useStore from "../store/personalZustand";

export const useSendMessage = async (
  typed: string,
  chatId: string,
  senderId: string,
  sharedKey: CryptoKey
) => {
  if (typed.trim() === "") return;

  const { ivBuffer, dataBuffer } = await encryptMessage(typed, sharedKey);

  const message = {
    chatId,
    senderId,
    cipher: {
      iv: ivBuffer,
      data: dataBuffer,
    },
  };

  const response = await fetch("http://localhost:3000/send-message", {
    method: "POST",
    body: JSON.stringify(message),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.log("something went wrong");
    return;
  }
};

type setMessages = React.Dispatch<React.SetStateAction<MessageSchema[]>>;
export const usePersonalSocket = (id: string, setMessages?: setMessages) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const sharedKey = useStore((state) => state?.sharedKey);
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

  const sendMessage = async (
    chatId: string,
    typed: string,
    senderId: string
  ) => {
    const { ivBuffer, dataBuffer } = await encryptMessage(typed, sharedKey);

    const message = {
      chatId,
      senderId,
      cipher: {
        iv: ivBuffer,
        data: dataBuffer,
      },
    };

    socket.emit("chatMessage", message);
  };

  const joinRoom = (chatId: string) => {
    if (!chatId) return;
    socket.emit("joinRoom", chatId);
  };

  useEffect(() => {
    const handler = async (msg: MessageSchema) => {
      console.log(msg);
      const newMessage = await decryptMessage(sharedKey, {
        iv: msg.cipher.iv,
        data: msg.cipher.data,
      });
      msg.meta = newMessage;
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
      setOnlineUsers(onlineUsersIds);
    };

    socket.on("onlineList", handleStatuses);

    return () => {
      socket.off("onlineList", handleStatuses);
    };
  }, []);

  return { sendMessage, joinRoom, onlineUsers };
};
