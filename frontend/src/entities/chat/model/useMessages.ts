import { useEffect, useState } from "react";
import { port } from "../../../util/ui/ProtectedRoutes";
import { encryptMessage, getSharedKey } from "./encryption";
import { useNavigate } from "react-router";
import { useKeyStore } from "../../../util/model/store/zustand";
import type { MessageSchema } from "../ui/chat-components/message-bubble/model/types";
import { useQuery } from "@tanstack/react-query";
import { decryptMessage } from "./decryption";
import { socket } from "../../../util/model/socket/socket";
import { useMessageStore } from "./messageZustand";
import { useUserStore, type userInfo } from "../../user/model/userZustand";
import { usersStore } from "../ui/chat-components/chat-sidebar/model/useChatSidebar";

type sendMessageSchema = {
  typed: string;
  chatId: string;
  senderId: string;
  sharedKey?: CryptoKey;
};

export type newMessageSchema = {
  message: {
    chatId: string;
    senderId: string;
    cipher: { iv: string; data: string };
  };
};

type chatData = {
  initialMessages: MessageSchema[];
  companion: userInfo;
};

interface hookScheme {
  chatId: string;
}

export const useMessages = ({ chatId }: hookScheme) => {
  const messages = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.setMessages);

  const user = useUserStore((state) => state.user);
  const users = usersStore((state) => state.users);
  const setUsers = usersStore((state) => state.setUsers);
  const keyPairs = useKeyStore((state) => state?.keyPairs);
  const changeSharedKey = useKeyStore((state) => state.changeSharedKey);
  const [sharedKey, setSharedKey] = useState<CryptoKey>();
  const setCompanionId = useUserStore((state) => state.setCompanionId);

  const navigate = useNavigate();

  const {
    data: { initialMessages, companion } = {
      initialMessages: [],
      companion: {
        id: "",
        login: "",
        profilePicture: "",
        role: "",
        email: "",
        description: "",
      },
    },
    isLoading,
  } = useQuery({
    queryKey: [chatId],
    queryFn: async (): Promise<chatData> => {
      const chatResponse = await fetch(`${port}/get-chat-info`, {
        method: "POST",
        body: JSON.stringify({ chatId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!chatResponse.ok) navigate("/auth?mode=login");

      const { chat, companion } = await chatResponse.json();
      setCompanionId(companion.id);
      return { initialMessages: chat.messages, companion };
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    setMessages([]);
    async function handle() {
      if (chatId && user?.id && keyPairs) {
        const newSharedKey = await getSharedKey(
          chatId,
          user.id,
          keyPairs.privateKey
        );

        changeSharedKey(newSharedKey);
        setSharedKey(newSharedKey);
        async function decryptMessages() {
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
  }, [chatId, user, keyPairs, initialMessages && initialMessages.length]);

  useEffect(() => {
    const handler = async (msg: MessageSchema) => {
      if (!sharedKey) return;
      console.log(msg);
      const newMessage = await decryptMessage(sharedKey, {
        iv: msg.cipher.iv,
        data: msg.cipher.data,
      });
      msg.meta = newMessage;
      const updatedUsers = users.map((u) =>
        u.id === companion.id ? { ...u, lastMessage: msg } : u
      );
      setUsers(updatedUsers);
      handleMessage(msg);
    };

    socket.on("chatMessage", handler);

    const handleDeleting = async ({ messageId }: { messageId: string }) => {
      const updatedMessages = messages
        .filter((msg): msg is MessageSchema => msg !== undefined)
        .filter((msg): msg is MessageSchema => messageId !== msg._id);
      setMessages(updatedMessages);
    };

    socket.on("deleteMessage", handleDeleting);

    return () => {
      socket.off("chatMessage", handler);
      socket.off("deleteMessage", handleDeleting);
    };
  });

  const handleMessage = (newMessage: MessageSchema) => {
    setMessages([...messages, newMessage]);
  };

  useEffect(() => {
    console.log(companion);
  }, [companion]);

  const sendMessage = async ({
    typed,
    chatId,
    senderId,
  }: sendMessageSchema) => {
    if (typed.trim() === "" || !sharedKey) return;
    const { iv, data } = await encryptMessage(typed, sharedKey);

    const message = {
      chatId,
      senderId,
      cipher: {
        iv,
        data,
      },
    };

    const response = await fetch(`${port}/send-message`, {
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

    const newMessage = await response.json();

    console.log(newMessage);

    socket.emit("chatMessage", newMessage);
  };

  return {
    sendMessage,
    sharedKey,
    messages,
    isLoading,
    companion,
    handleMessage,
  };
};
