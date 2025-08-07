import { useQuery } from "@tanstack/react-query";
import {
  useUserStore,
  type userInfo,
} from "../../../../../user/model/userZustand";
import { port } from "../../../../../../util/ui/ProtectedRoutes";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useKeyStore } from "../../../../../../util/model/store/zustand";
import type { MessageSchema } from "../../message-bubble/model/types";
import { getSharedKey } from "../../../../model/encryption";
import { decryptMessage } from "../../../../model/decryption";
import { create } from "zustand";

export interface User extends userInfo {
  lastMessage: MessageSchema;
}

type userStoreSchema = {
  users: User[];
  setUsers: (users: User[]) => void;
};

export const usersStore = create<userStoreSchema>((set) => ({
  users: [],
  setUsers: (users: User[]) => {
    set({ users: users });
  },
}));

export const useChatSidebar = () => {
  const user = useUserStore((state) => state.user);
  const [typed, setTyped] = useState<string>("");

  const users = usersStore((state) => state.users);
  const setUsers = usersStore((state) => state.setUsers);

  const { data, isLoading } = useQuery({
    queryKey: ["chats"],
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

  const openChat = async (otherUserId: string) => {
    const response = await fetch(`${port}/chats/${otherUserId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();
    navigate(`/chats/${responseData.chatId}`);
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
        const { lastMessage } = curUser;

        const { chatId, cipher } = lastMessage;

        const newSharedKey = await getSharedKey(
          chatId,
          user?.id ?? "",
          keyPairs!.privateKey
        );

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
