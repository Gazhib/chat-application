import { useEffect, useState } from "react";
import { port } from "../../../util/ui/ProtectedRoutes";
import { encryptMessage, getSharedKey } from "./encryption";
import { useNavigate } from "react-router";
import { useKeyStore, useUserStore } from "../../../util/model/store/zustand";
import type { MessageSchema } from "../ui/chat-components/message-bubble/model/types";
import { useQuery } from "@tanstack/react-query";
import { decryptMessage } from "./decryption";
import { usePersonalSocket } from "../../../util/model/socket/usePersonalSocket";

type sendMessageSchema = {
  typed: string;
  chatId: string;
  senderId: string;
  sharedKey?: CryptoKey;
};

type chatData = {
  initialMessages: MessageSchema[];
  user: {
    _id: string;
    login: string;
  };
};

interface hookScheme {
  chatId: string;
}

export const useMessages = ({ chatId }: hookScheme) => {
  const [messages, setMessages] = useState<MessageSchema[]>([]);

  const user = useUserStore((state) => state.user);
  const keyPairs = useKeyStore((state) => state?.keyPairs);
  const changeSharedKey = useKeyStore((state) => state.changeSharedKey);
  const [sharedKey, setSharedKey] = useState<CryptoKey>();

  const navigate = useNavigate();

  
  const {
    data: { initialMessages, user: companion } = {
      initialMessages: [],
      user: { _id: "", login: "" },
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

      const { chat, user } = await chatResponse.json();
      return { initialMessages: chat.messages, user };
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
          console.log(companion.login);
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

  const handleMessage = (newMessage: MessageSchema) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const { sendMessage: socketSendMessage } = usePersonalSocket({
    id: user?.id ?? "",
    handleMessage,
  });

  const sendMessage = async ({
    typed,
    chatId,
    senderId,
    sharedKey,
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
    socketSendMessage(chatId || "", typed, user?.id ?? "");
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
