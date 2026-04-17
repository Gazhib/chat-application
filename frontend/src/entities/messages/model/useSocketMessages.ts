import { useCallback, useEffect } from "react";
import type { MessageSchema } from "../ui/message-bubble/types";
import { useMessageStore } from "./messageZustand";
import { usersStore } from "@/entities/user-list/model/useChatSidebar";
import useCompanionQuery, { getCompanion } from "./useCompanionQuery";
import { useKeyStore } from "@/util/model/zustand";
import { useUserStore } from "@/entities/user/model/userZustand";
import { useParams } from "react-router";
import { unstable_batchedUpdates } from "react-dom";
import { decryptMessage } from "@/entities/chat/model/decryption";
import {
  getSharedKey,
  isPeerPublicKeyUnavailableError,
} from "@/entities/chat/model/encryption";
import { socket } from "@/util/model/socket/socket";
import { handleUpdateUsersList } from "./useMessages";

export const useSocketMessages = () => {
  const messages = useMessageStore((state) => state.messages);
  const users = usersStore((state) => state.users);
  const setUsers = usersStore((state) => state.setUsers);
  const setMessages = useMessageStore((state) => state.setMessages);

  const { companion } = useCompanionQuery();

  const { chatId } = useParams();

  // Subscribe to the shared key for the currently open chat only.
  // Other chats' keys remain cached in the Map and are not affected.
  const currentChatSharedKey = useKeyStore(
    (state) => (chatId ? state.sharedKeys.get(chatId) : undefined)
  );
  const keyPairs = useKeyStore((state) => state.keyPairs);
  const setSharedKeyForChat = useKeyStore((state) => state.setSharedKeyForChat);

  const user = useUserStore((state) => state.user);
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
      // Message arrived for a chat the user is not currently viewing:
      // update the sidebar user list but do not attempt decryption.
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

      // Own messages are already in state from the optimistic write in sendMessage.
      if (msg.senderId === user?._id) return;

      let decryptedMsg: MessageSchema;

      if (!msg.cipher?.iv || !msg.cipher?.data || msg.messageType === "call") {
        // No encrypted payload expected (call record or future message type).
        decryptedMsg = { ...msg, encryptionStatus: "none" };
      } else if (!currentChatSharedKey) {
        // Shared key not yet derived (race: socket message arrived before
        // handleDecrypting completed). Mark as pending so the UI can show a
        // placeholder. handleDecrypting will re-decrypt on next run.
        console.warn(
          "[crypto] Shared key unavailable for chat",
          chatId,
          "— marking message as pending"
        );
        decryptedMsg = { ...msg, encryptionStatus: "pending" };
      } else {
        try {
          const plaintext = await decryptMessage(currentChatSharedKey, {
            iv: msg.cipher.iv,
            data: msg.cipher.data,
          });

          decryptedMsg = {
            ...msg,
            meta: plaintext,
            encryptionStatus: "decrypted",
          };
        } catch {
          try {
            if (!keyPairs) {
              throw new Error("Local key pair is unavailable");
            }

            const { key: refreshedKey } = await getSharedKey(
              msg.chatId,
              keyPairs.privateKey
            );

            setSharedKeyForChat(msg.chatId, refreshedKey);

            const plaintext = await decryptMessage(refreshedKey, {
              iv: msg.cipher.iv,
              data: msg.cipher.data,
            });

            decryptedMsg = {
              ...msg,
              meta: plaintext,
              encryptionStatus: "decrypted",
            };
          } catch (retryError) {
            if (!isPeerPublicKeyUnavailableError(retryError)) {
              console.error(
                "[crypto] Failed to decrypt real-time message",
                msg._id,
                retryError
              );
            }

            decryptedMsg = { ...msg, encryptionStatus: "failed" };
          }
        }
      }

      const updatedUsers = handleUpdateUsersList(
        decryptedMsg,
        users,
        companion!,
        chatId!,
        user!
      );

      unstable_batchedUpdates(() => {
        setUsers(updatedUsers);
        if (chatId === msg.chatId) handleMessage(decryptedMsg);
      });
    },
    [chatId, companion, currentChatSharedKey, keyPairs, setSharedKeyForChat, user, users]
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
