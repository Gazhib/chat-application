import { useNavigate } from "react-router";
import pp from "/pp.png";
import { useQuery } from "@tanstack/react-query";
import { usePersonalSocket } from "../../../../../../../util/model/socket/usePersonalSocket";
import { port } from "../../../../../../../util/ui/ProtectedRoutes";
import { useUserStore } from "../../../../../../user/model/userZustand";
import type { MessageSchema } from "../../../message-bubble/model/types";
import { getSharedKey } from "../../../../../model/encryption";
import { useEffect } from "react";
import { useKeyStore } from "../../../../../../../util/model/store/zustand";
import { decryptMessage } from "../../../../../model/decryption";

type User = {
  login: string;
  _id: string;
  profilePicture: string;
  lastMessage: MessageSchema;
};

interface ChatList {
  typed: string;
}

export default function ChatList({ typed }: ChatList) {
  const user = useUserStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch(`${port}/get-users`, {
        method: "GET",
        credentials: "include",
      });
      const responseData = await response.json();

      if (!response.ok) return [];
      return responseData;
    },
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

  const searchResults = data?.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(typed.toLowerCase())
  );

  const keyPairs = useKeyStore((state) => state.keyPairs);

  useEffect(() => {
    if (!data) return;
    const handle = async () => {
      data.map(async (curUser) => {
        const { lastMessage } = curUser;

        const { chatId, cipher, createdAt } = lastMessage;

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
      });
    };
    handle();
  }, [data]);
  const { onlineUsers } = usePersonalSocket({ id: user?.id ?? "" });
  return (
    <ul>
      {!isLoading && searchResults
        ? searchResults.map((curUser) => {
            return (
              <button
                onClick={() => openChat(curUser._id)}
                key={curUser._id}
                className="h-[60px] px-[10px] relative w-full items-center gap-[10px] flex flex-row border-b-[1px] border-[#333333] hover:bg-[#2E2F30] text-white cursor-pointer"
              >
                <img
                  src={curUser.profilePicture ? curUser.profilePicture : pp}
                  className="w-[50px] h-[50px] object-cover rounded-full"
                />
                <section className="flex flex-col justify-center">
                  <span className="text-[16px]">{curUser.login}</span>
                  <span className="text-[12px] text-[#9A9C99] self-start">
                    {curUser?.lastMessage?.meta}
                  </span>
                </section>
                {onlineUsers.includes(curUser._id) && (
                  <div className="absolute w-[10px] h-[10px] bg-green-600 rounded-full left-[45px] bottom-[5px]" />
                )}
              </button>
            );
          })
        : null}
    </ul>
  );
}
