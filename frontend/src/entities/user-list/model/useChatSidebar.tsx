import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import type { MessageSchema } from "../../messages/ui/message-bubble/model/types";
import { port } from "@/util/ui/ProtectedRoutes";
import { useKeyStore } from "@/util/model/store/zustand";
import { getSharedKey } from "@/entities/chat/model/encryption";
import { decryptMessage } from "@/entities/chat/model/decryption";
import { useMessageStore } from "@/entities/messages/model/messageZustand";
export interface User extends userInfo {
  lastMessage: MessageSchema;
  chatId: string;
}

type userStoreSchema = {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
};

export const usersStore = create<userStoreSchema>((set) => ({
  users: [],
  setUsers: (users: User[]) => {
    set({ users: users });
  },
  addUser: (user: User) => {
    set((state) => ({ users: [user, ...state.users] }));
  },
}));

export const useChatSidebar = () => {
  const user = useUserStore((state) => state.user);
  const [typed, setTyped] = useState<string>("");

  const users = usersStore((state) => state.users);
  const setUsers = usersStore((state) => state.setUsers);

  const { data, isLoading } = useQuery({
    queryKey: ["chats", user?._id],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch(`${port}/users`, {
        method: "GET",
        credentials: "include",
      });
      const responseData = await response.json();

      if (!response.ok) return [];
      setUsers(responseData);
      return responseData;
    },
    staleTime: Infinity,
  });

  const navigate = useNavigate();

  const setMessages = useMessageStore((state) => state.setMessages);

  const openChat = async (chatId: string, companionId: string) => {
    setTyped("");
    let finalChatId = chatId;
    if (!chatId) {
      const response = await fetch(`${port}/chats`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId }),
      });

      const chat = await response.json();
      finalChatId = chat._id;
    }
    setMessages([]);
    navigate(`/chats/${finalChatId}`);
  };

  const { data: searchResults, isLoading: isSearchResultsLoading } = useQuery({
    queryKey: ["typed", typed],
    queryFn: async () => {
      const response = await fetch(`${port}/users/${typed}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Something went wrong...");
      }

      const responseData: User[] = await response.json();
      return responseData;
    },
    staleTime: Infinity,
    enabled: typed.trim() !== "",
  });

  const keyPairs = useKeyStore((state) => state.keyPairs);

  useEffect(() => {
    if (!data) return;
    const handle = async () => {
      const updatedUsers = data.map(async (curUser) => {
        const {
          lastMessage = { meta: "", chatId: "", cipher: { iv: "", data: "" } },
        } = curUser;

        if (!lastMessage.chatId || !keyPairs) return curUser;

        const { chatId, cipher } = lastMessage;

        const newSharedKey = await getSharedKey(chatId, keyPairs!.privateKey);

        const newMessage = await decryptMessage(newSharedKey, {
          iv: cipher.iv,
          data: cipher.data,
        });
        curUser.lastMessage.meta = newMessage;
        return curUser;
      });
      const resolvedUsers = await Promise.all(updatedUsers);
      setUsers(resolvedUsers);
    };
    handle();
  }, [data]);

  return {
    typed,
    setTyped,
    searchResults,
    isLoading,
    isSearchResultsLoading,
    openChat,
    user,
    users,
  };
};
