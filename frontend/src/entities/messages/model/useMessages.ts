import { useRef } from "react";
import { port } from "@util/ui/ProtectedRoutes";
import { encryptMessage, getSharedKey } from "../../chat/model/encryption";
import { useParams } from "react-router";
import { useKeyStore } from "@util/model/store/zustand";
import { decryptMessage } from "../../chat/model/decryption";
import { socket } from "@util/model/socket/socket";
import { useMessageStore } from "./messageZustand";
import { useUserStore, type userInfo } from "@entities/user/model/userZustand";
import type { MessageSchema } from "@/entities/messages/ui/message-bubble/model/types";
import {
  usersStore,
  type User,
} from "@/entities/user-list/model/useChatSidebar";
import useCompanionQuery from "./useCompanionQuery";
import useMessagesQuery from "./useMessagesQuery";

type sendMessageSchema = {
  typed: string;
  chatId: string;
  sharedKey?: CryptoKey;
  picture: string | undefined;
  type?: string;
  roomId?: string;
};

export const handleUsersOrder = (companionId: string, updatedUsers: User[]) => {
  const userIndex = updatedUsers.findIndex((u) => u._id === companionId);
  const newUsers = [...updatedUsers];
  if (userIndex !== -1) {
    const [user] = newUsers.splice(userIndex, 1);
    newUsers.unshift(user);
  }
  return newUsers;
};

export const handleUpdateUsersList = (
  msg: MessageSchema,
  users: User[],
  companion: userInfo | undefined,
  chatId: string,
  user: userInfo | undefined
) => {
  let updatedUsers = users;

  if (!users.find((u) => u._id === companion?._id)) {
    const newUser: User = {
      email: companion!.email,
      login: companion!.login,
      role: companion!.role,
      _id: companion!._id,
      profilePicture: companion?.profilePicture,
      description: companion?.description,
      lastMessage: msg,
      chatId: chatId!,
    };
    updatedUsers.push(newUser);
  }
  updatedUsers = users.map((u) =>
    u.chatId === msg.chatId ? { ...u, lastMessage: msg } : u
  );
  updatedUsers = handleUsersOrder(
    msg.senderId === user?._id ? companion!._id : msg.senderId,
    updatedUsers
  );
  return updatedUsers;
};

export const useMessages = () => {
  const messages = useMessageStore((state) => state.messages);
  const messageLength = useMessageStore((state) => state.messages.length);
  const setMessages = useMessageStore((state) => state.setMessages);
  const addMessages = useMessageStore((state) => state.addMessages);

  const { chatId } = useParams();

  const user = useUserStore((state) => state.user);

  const users = usersStore((state) => state.users);
  const setUsers = usersStore((state) => state.setUsers);

  const keyPairs = useKeyStore((state) => state?.keyPairs);

  const sharedKey = useKeyStore((state) => state.sharedKey);
  const changeSharedKey = useKeyStore((state) => state.changeSharedKey);

  const addSingleMessage = useMessageStore((state) => state.addSingleMessage);

  const { companion } = useCompanionQuery();
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useMessagesQuery();

  const decryptGeneration = useRef(0);

  const decryptMessages = async (
    newSharedKey: CryptoKey,
    messagesToDecrypt: MessageSchema[],
    myGen: number
  ) => {
    if (decryptGeneration.current !== myGen) return;
    return await Promise.all(
      messagesToDecrypt.map(async (message: MessageSchema) => {
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
  };
  const handleDecrypting = async () => {
    if (!chatId || !user?._id || !keyPairs || !data?.pages) return;
    const myGen = ++decryptGeneration.current;
    const newSharedKey = await getSharedKey(chatId, keyPairs.privateKey);
    let decryptedMessages: MessageSchema[] = [];
    if ((data.pages?.length - 1) * 30 > messageLength) {
      decryptedMessages =
        [...data.pages].reverse().flatMap((page) => page.messages) || [];
    } else {
      decryptedMessages = data?.pages[data.pages.length - 1]?.messages || [];
    }
    changeSharedKey(newSharedKey);
    if (decryptedMessages.length > 0 && newSharedKey) {
      const decrypted = await decryptMessages(
        newSharedKey,
        decryptedMessages,
        myGen
      );
      addMessages(
        (decrypted ?? []).filter(
          (msg): msg is MessageSchema => msg !== undefined
        )
      );
    }
  };

  const handleMessage = (newMessage: MessageSchema) => {
    addSingleMessage(newMessage);
  };

  const handleCreateMessage = async (
    typed: string,
    picture: string | undefined,
    type: string,
    roomId: string
  ) => {
    const { iv, data } = await encryptMessage(typed, sharedKey!);

    const message = {
      chatId: chatId ?? "",
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
    };

    return { msg, message };
  };

  const sendMessage = async ({
    typed,
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

    const { msg, message } = await handleCreateMessage(
      typed,
      picture,
      type || "",
      roomId || ""
    );

    handleMessage(msg);
    const updatedUsers = handleUpdateUsersList(
      msg,
      users,
      companion,
      chatId!,
      user
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
      return;
    }

    const newMessage = await response.json();

    socket.emit("chatMessage", { ...newMessage, companionId: companion?._id });
  };

  const readMessage = async (messageId: string) => {
    const response = await fetch(`${port}/messages/${messageId}`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!response.ok) {
      return;
    }
    const updatedMessage = await response.json();
    const updatedMessages = messages.map((msg) =>
      msg._id === messageId
        ? { ...msg, status: { read: 1, delievered: 1 } }
        : msg
    );

    const updatedUsers = users.map((u) => {
      return u.chatId === updatedMessage.chatId
        ? {
            ...u,
            lastMessage: {
              ...u.lastMessage,
              status: { read: 1, delievered: 1 },
            },
          }
        : u;
    });

    setUsers(updatedUsers);

    setMessages(updatedMessages);
  };

  return {
    sendMessage,
    sharedKey,
    messages,
    isLoading,
    fetchNextPage,
    companion,
    handleMessage,
    isFetchingNextPage,
    hasNextPage,
    handleDecrypting,
    data,
    readMessage,
  };
};
