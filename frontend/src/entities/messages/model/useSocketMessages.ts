import { useCallback, useEffect } from "react";
import type { MessageSchema } from "../ui/message-bubble/model/types";
import { useMessageStore } from "./messageZustand";
import { usersStore } from "@/entities/user-list/model/useChatSidebar";
import useCompanionQuery, { getCompanion } from "./useCompanionQuery";
import { useKeyStore } from "@/util/model/store/zustand";
import { useUserStore } from "@/entities/user/model/userZustand";
import { useParams } from "react-router";
import { unstable_batchedUpdates } from "react-dom";
import { decryptMessage } from "@/entities/chat/model/decryption";
import { socket } from "@/util/model/socket/socket";
import { handleUpdateUsersList } from "./useMessages";

export const useSocketMessages = () => {
  const messages = useMessageStore((state) => state.messages);
  const users = usersStore((state) => state.users);
  const setUsers = usersStore((state) => state.setUsers);
  const setMessages = useMessageStore((state) => state.setMessages);

  const { companion } = useCompanionQuery();

  const sharedKey = useKeyStore((state) => state.sharedKey);
  const user = useUserStore((state) => state.user);
  const { chatId } = useParams();
  const addSingleMessage = useMessageStore((state) => state.addSingleMessage);
  const handleMessage = (msg: MessageSchema) => {
    addSingleMessage(msg);
  };

  const handleDeleteMessage = useCallback(
    async ({ messageId }: { messageId: string }) => {
      const updatedMessages = messages
        .filter((msg): msg is MessageSchema => msg !== undefined)
        .filter((msg): msg is MessageSchema => messageId !== msg._id);

      const updatedUsers = users.map((u) =>
        u._id === companion?._id
          ? { ...u, lastMessage: updatedMessages[updatedMessages.length - 1] }
          : u
      );
      setUsers(updatedUsers);
      setMessages(updatedMessages);
    },
    [companion?._id, messages, setMessages, setUsers, users]
  );
  const handleReceiveMessage = useCallback(
    async (msg: MessageSchema) => {
      if (msg.chatId !== chatId || !chatId) {
        const updatedUsers = handleUpdateUsersList(
          msg,
          users,
          companion ?? (await getCompanion(msg.chatId)),
          chatId ?? msg.chatId,
          user!
        );
        setUsers(updatedUsers);
        return;
      }
      if (!sharedKey || msg.senderId === user?._id) return;
      const messageMeta = await decryptMessage(sharedKey, {
        iv: msg.cipher.iv,
        data: msg.cipher.data,
      });
      msg.meta = messageMeta;
      const updatedUsers = handleUpdateUsersList(
        msg,
        users,
        companion!,
        chatId!,
        user!
      );
      unstable_batchedUpdates(() => {
        setUsers(updatedUsers);
        if (chatId === msg.chatId) handleMessage(msg);
      });
    },
    [chatId, users, sharedKey, user?._id]
  );

  useEffect(() => {
    socket.on("chatMessage", handleReceiveMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("chatMessage", handleReceiveMessage);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [handleReceiveMessage, handleDeleteMessage]);
};
