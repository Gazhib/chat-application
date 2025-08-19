import { useEffect, useState } from "react";
import { port } from "@util/ui/ProtectedRoutes";
import { encryptMessage, getSharedKey } from "./encryption";
import { useNavigate } from "react-router";
import { useKeyStore } from "@util/model/store/zustand";
import { useQuery } from "@tanstack/react-query";
import { decryptMessage } from "./decryption";
import { socket } from "@util/model/socket/socket";
import { useMessageStore } from "./messageZustand";
import { useUserStore, type userInfo } from "@entities/user/model/userZustand";
import type { MessageSchema } from "@/entities/messages/ui/message-bubble/model/types";
import { usersStore } from "@/entities/user-list/model/useChatSidebar";

type sendMessageSchema = {
  typed: string;
  chatId: string;
  sharedKey?: CryptoKey;
  picture: string | undefined;
  type?: string;
  roomId?: string;
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
        _id: "",
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
      const chatResponse = await fetch(
        `${port}/chats/${chatId}/messages?limit=30`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!chatResponse.ok) navigate("/auth?mode=login");

      const { nextCursor, messages, companion } = await chatResponse.json();

      setCompanionId(companion._id);
      return { initialMessages: messages.reverse(), companion };
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    setMessages([]);
    async function handle() {
      if (chatId && user?._id && keyPairs) {
        const newSharedKey = await getSharedKey(chatId, keyPairs.privateKey);

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
      const newMessage = await decryptMessage(sharedKey, {
        iv: msg.cipher.iv,
        data: msg.cipher.data,
      });
      msg.meta = newMessage;
      if (msg.senderId === user?._id) return;
      const updatedUsers = users.map((u) =>
        u._id === companion._id ? { ...u, lastMessage: msg } : u
      );
      setUsers(updatedUsers);
      handleMessage(msg);
    };

    socket.on("chatMessage", handler);

    const handleDeleting = async ({ messageId }: { messageId: string }) => {
      const updatedMessages = messages
        .filter((msg): msg is MessageSchema => msg !== undefined)
        .filter((msg): msg is MessageSchema => messageId !== msg._id);
      const updatedUsers = users.map((u) =>
        u._id === companion._id
          ? { ...u, lastMessage: updatedMessages[updatedMessages.length - 1] }
          : u
      );
      setUsers(updatedUsers);
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

  const sendMessage = async ({
    typed,
    chatId,
    picture,
    type,
    roomId,
  }: sendMessageSchema) => {
    if (
      (typed.trim() === "" && picture === undefined && roomId?.trim() === "") ||
      !sharedKey
    )
      return;
    const formData = new FormData();
    if (picture) {
      const blob = await fetch(picture).then((r) => r.blob());
      const newFile = new File([blob], "profile.png", {
        type: "image/png",
      });

      formData.append("image", newFile);
    }

    const { iv, data } = await encryptMessage(typed, sharedKey);

    const message = {
      chatId,
      cipher: {
        iv,
        data,
      },
      picture,
      messageType: type
        ? type
        : picture && typed
        ? "mix"
        : picture
        ? "picture"
        : "txt",
      roomId,
    };
    const createdAt = new Date();
    const msg = {
      ...message,
      senderId: user?._id ?? "",
      createdAt,
      seq: 0,
      meta: typed,
      status: {
        delievered: 0,
        read: 0,
      },
      cipher: {
        iv,
        data,
      },
      roomId,
    };
    handleMessage(msg);

    const updatedUsers = users.map((u) =>
      u._id === companion._id ? { ...u, lastMessage: msg } : u
    );
    setUsers(updatedUsers);

    formData.append("message", JSON.stringify(message));
    if (type === "call") formData.append("type", type);

    const response = await fetch(`${port}/messages`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!response.ok) {
      console.log(await response.json());
      return;
    }

    const newMessage = await response.json();

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
