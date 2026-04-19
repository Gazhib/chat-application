import type { MessageSchema } from "@/entities/messages/ui/message-bubble/types";
import {
  usersStore,
  type User,
} from "@/entities/user-list/model/useChatSidebar";
import { socket } from "@/util/model/socket";
import { useKeyStore } from "@/util/model/zustand";
import { useUserStore, type userInfo } from "@entities/user/model/userZustand";
import { apiUrl } from "@util/model/api";
import { useRef } from "react";
import { useParams } from "react-router";
import { decryptMessage } from "../../chat/model/decryption";
import {
  encryptMessage,
  getSharedKey,
  isPeerPublicKeyUnavailableError,
} from "../../chat/model/encryption";
import { useMessageStore } from "./messageZustand";
import useCompanionQuery from "./useCompanionQuery";
import useMessagesQuery from "./useMessagesQuery";

type sendMessageSchema = {
  typed: string;
  chatId: string;
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

const getMessageIdentity = (message: MessageSchema) =>
  message._id ?? `${message.chatId}:${String(message.seq)}:${message.createdAt}`;

const mergeMessages = (
  incoming: MessageSchema[],
  existing: MessageSchema[]
): MessageSchema[] => {
  const incomingIds = new Set(incoming.map(getMessageIdentity));
  return [
    ...incoming,
    ...existing.filter((message) => !incomingIds.has(getMessageIdentity(message))),
  ];
};

const markMessagesPending = (
  messagesToMark: MessageSchema[]
): MessageSchema[] =>
  messagesToMark.map((message) => {
    if (
      message.messageType === "call" ||
      !message.cipher?.iv ||
      !message.cipher?.data
    ) {
      return { ...message, encryptionStatus: "none" as const };
    }

    return { ...message, encryptionStatus: "pending" as const };
  });

export const useMessages = () => {
  const messages = useMessageStore((state) => state.messages);
  const messageLength = useMessageStore((state) => state.messages.length);
  const setMessages = useMessageStore((state) => state.setMessages);
  const updateMessageId = useMessageStore((state) => state.updateMessageId);

  const { chatId } = useParams();

  const user = useUserStore((state) => state.user);

  const users = usersStore((state) => state.users);
  const setUsers = usersStore((state) => state.setUsers);

  const keyPairs = useKeyStore((state) => state?.keyPairs);

  // Per-chat shared key: avoids destroying the key for Chat A when opening Chat B.
  const sharedKey = useKeyStore(
    (state) => (chatId ? state.sharedKeys.get(chatId) : undefined)
  );
  const setSharedKeyForChat = useKeyStore(
    (state) => state.setSharedKeyForChat
  );

  const addSingleMessage = useMessageStore((state) => state.addSingleMessage);

  const { companion } = useCompanionQuery();
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useMessagesQuery();

  // Incremented each time handleDecrypting starts. Each async decrypt batch
  // checks its own generation number before writing to state, so a superseded
  // batch (e.g. the user switched chats) discards its results without stomping
  // on newer data.
  const decryptGeneration = useRef(0);

  const decryptMessages = async (
    newSharedKey: CryptoKey,
    messagesToDecrypt: MessageSchema[],
    myGen: number
  ): Promise<MessageSchema[]> => {
    if (decryptGeneration.current !== myGen) return [];

    return Promise.all(
      messagesToDecrypt.map(async (message: MessageSchema) => {
        // Call-type messages store the room ID in the `roomId` field and do not
        // carry meaningful cipher data.
        if (
          message.messageType === "call" ||
          !message.cipher?.iv ||
          !message.cipher?.data
        ) {
          return { ...message, encryptionStatus: "none" as const };
        }

        try {
          const plaintext = await decryptMessage(newSharedKey, {
            iv: message.cipher.iv,
            data: message.cipher.data,
          });
          return {
            ...message,
            meta: plaintext,
            encryptionStatus: "decrypted" as const,
          };
        } catch {
          try {
            if (!keyPairs) {
              throw new Error("Local key pair is unavailable");
            }

            const { key: refreshedKey } = await getSharedKey(
              message.chatId,
              keyPairs.privateKey
            );

            setSharedKeyForChat(message.chatId, refreshedKey);

            const plaintext = await decryptMessage(refreshedKey, {
              iv: message.cipher.iv,
              data: message.cipher.data,
            });

            return {
              ...message,
              meta: plaintext,
              encryptionStatus: "decrypted" as const,
            };
          } catch (retryError) {
            // Do not silently drop: surface a 'failed' status so the UI can
            // show an "unable to decrypt" indicator instead of a blank bubble.
            console.error(
              "[crypto] Decryption failed for message",
              message._id,
              retryError
            );
            return { ...message, encryptionStatus: "failed" as const };
          }
        }
      })
    );
  };

  const handleDecrypting = async () => {
    if (!chatId || !user?._id || !keyPairs || !data?.pages) return;

    const myGen = ++decryptGeneration.current;

    const shouldProcessAllPages =
      messages.some((message) => message.encryptionStatus === "pending") ||
      (data.pages.length - 1) * 30 > messageLength;

    const messagesToDecrypt = shouldProcessAllPages
      ? [...data.pages].reverse().flatMap((page) => page.messages) ?? []
      : data.pages[data.pages.length - 1]?.messages ?? [];

    // Use the cached shared key if available; derive it only when necessary.
    // This avoids a network round-trip on every pagination event.
    let resolvedKey = useKeyStore.getState().sharedKeys.get(chatId);
    if (!resolvedKey) {
      try {
        const { key } = await getSharedKey(chatId, keyPairs.privateKey);
        setSharedKeyForChat(chatId, key);
        resolvedKey = key;
      } catch (e) {
        if (isPeerPublicKeyUnavailableError(e)) {
          if (decryptGeneration.current !== myGen) return;
          setMessages(
            mergeMessages(
              markMessagesPending(messagesToDecrypt),
              useMessageStore.getState().messages
            )
          );
          return;
        }

        console.error("[crypto] Could not derive shared key for chat", chatId, e);
        return;
      }
    }

    const decrypted = await decryptMessages(resolvedKey, messagesToDecrypt, myGen);

    // Re-check generation after the async gap; another chat navigation may have
    // started a newer run while we were awaiting.
    if (decryptGeneration.current !== myGen) return;

    setMessages(mergeMessages(decrypted, useMessageStore.getState().messages));
  };

  const handleMessage = (newMessage: MessageSchema) => {
    addSingleMessage(newMessage);
  };

  // Builds the wire payload and a local optimistic copy of the message.
  // The optimistic copy uses a temporary UUID as _id so it can be replaced
  // with the real server _id once the POST /messages response arrives.
  const handleCreateMessage = async (
    typed: string,
    currentSharedKey: CryptoKey,
    picture: string | undefined,
    type: string,
    roomId: string
  ) => {
    const { iv, data } = await encryptMessage(typed, currentSharedKey);

    const wirePayload = {
      chatId: chatId ?? "",
      cipher: { iv, data },
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

    // Temporary client-side ID — replaced by updateMessageId after API response.
    const tempId = crypto.randomUUID();

    const optimisticMsg: MessageSchema = {
      ...wirePayload,
      _id: tempId,
      senderId: user?._id ?? "",
      createdAt: new Date(),
      seq: 0,
      meta: typed,
      encryptionStatus: "decrypted",
      status: { delievered: 0, read: 0 },
    };

    return { optimisticMsg, wirePayload, tempId };
  };

  const sendMessage = async ({
    typed,
    picture,
    type,
    roomId,
  }: sendMessageSchema) => {
    // Explicit guard: do not allow sending if the shared key has not been derived.
    if (
      (typed.trim() === "" && picture === undefined && roomId?.trim() === "") ||
      !sharedKey
    )
      return;

    const formData = new FormData();
    if (picture) {
      const blob = await fetch(picture).then((r) => r.blob());
      const newFile = new File([blob], "profile.png", { type: "image/png" });
      formData.append("image", newFile);
    }

    let keyForSend = sharedKey;

    if (chatId && keyPairs) {
      try {
        const { key: refreshedKey } = await getSharedKey(chatId, keyPairs.privateKey);
        setSharedKeyForChat(chatId, refreshedKey);
        keyForSend = refreshedKey;
      } catch (e) {
        if (!isPeerPublicKeyUnavailableError(e)) {
          console.warn(
            "[crypto] Falling back to cached shared key while sending",
            chatId,
            e
          );
        }
      }
    }

    const { optimisticMsg, wirePayload, tempId } = await handleCreateMessage(
      typed,
      keyForSend,
      picture,
      type || "",
      roomId || ""
    );

    // Optimistically show the message immediately (with tempId).
    handleMessage(optimisticMsg);
    const updatedUsers = handleUpdateUsersList(
      optimisticMsg,
      users,
      companion,
      chatId!,
      user
    );
    setUsers(updatedUsers);

    console.log("sending message with payload", wirePayload);

    formData.append("message", JSON.stringify(wirePayload));
    if (type === "call") formData.append("type", type);

    const response = await fetch(`${apiUrl}/messages`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) return;

    const savedMessage = await response.json();

    // Replace the optimistic tempId with the real server-assigned _id so that
    // context-menu delete and read-receipt actions target the correct document.
    if (savedMessage._id) {
      updateMessageId(tempId, savedMessage._id);
    }

    socket.emit("chatMessage", {
      ...savedMessage,
      companionId: companion?._id,
    });
  };

  const readMessage = async (messageId: string) => {
    const response = await fetch(`${apiUrl}/messages/${messageId}`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!response.ok) return;

    const updatedMessage = await response.json();
    const updatedMessages = messages.map((msg) =>
      msg._id === messageId
        ? { ...msg, status: { read: 1, delievered: 1 } }
        : msg
    );

    const updatedUsers = users.map((u) =>
      u.chatId === updatedMessage.chatId
        ? {
            ...u,
            lastMessage: {
              ...u.lastMessage,
              status: { read: 1, delievered: 1 },
            },
          }
        : u
    );

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

