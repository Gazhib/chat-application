import { useEffect, useState } from "react";
import type { MessageSchema } from "../../../entities/chat/ui/chat-components/message-bubble/model/types";
import { useKeyStore } from "../store/zustand";
import { socket } from "./socket";
import { encryptMessage } from "../../../entities/chat/model/encryption";
import { decryptMessage } from "../../../entities/chat/model/decryption";
import { useParams } from "react-router";

interface hookScheme {
  id: string;
  handleMessage?: (newMessage: MessageSchema) => void;
}
export const usePersonalSocket = ({ id, handleMessage }: hookScheme) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { chatId } = useParams();
  const sharedKey = useKeyStore((state) => state?.sharedKey);
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
    if (!sharedKey) return;
    const { iv, data } = await encryptMessage(typed, sharedKey);

    const message = {
      chatId,
      senderId,
      cipher: {
        iv: iv,
        data: data,
      },
    };

    socket.emit("chatMessage", message);
  };

  useEffect(() => {
    const handler = async (msg: MessageSchema) => {
      if (!sharedKey) return;
      const newMessage = await decryptMessage(sharedKey, {
        iv: msg.cipher.iv,
        data: msg.cipher.data,
      });
      msg.meta = newMessage;
      if (handleMessage) handleMessage(msg);
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

  useEffect(() => {
    if (!chatId) return;
    socket.emit("joinRoom", chatId);
  }, [chatId]);

  return { sendMessage, onlineUsers };
};
