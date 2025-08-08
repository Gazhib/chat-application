import { useEffect, useState } from "react";
import type { MessageSchema } from "../../../entities/chat/ui/chat-components/message-bubble/model/types";
import { socket } from "./socket";
import { useParams } from "react-router";
import { useUserStore } from "../../../entities/user/model/userZustand";

interface hookScheme {
  id: string;
  handleMessage?: (newMessage: MessageSchema) => void;
}
export const usePersonalSocket = ({ id }: hookScheme) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { chatId } = useParams();
  const companionId = useUserStore((state) => state.companionId);

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
    if (!chatId || !companionId) return;
    socket.emit("joinRoom", { chatId, companionId });
  }, [chatId, companionId]);

  return { onlineUsers };
};
