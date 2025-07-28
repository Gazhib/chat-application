import { useNavigate } from "react-router";
import pp from "/pp.png";
import { useQuery } from "@tanstack/react-query";
import { usePersonalSocket } from "../../../../../../../util/model/socket/usePersonalSocket";
import { port } from "../../../../../../../util/ui/ProtectedRoutes";
import { useUserStore } from "../../../../../../user/model/userZustand";

type User = {
  login: string;
  lastMessage: string;
  _id: string;
  profilePicture: string;
};

interface ChatList {
  typed: string;
}

export default function ChatList({ typed }: ChatList) {
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

  const info = useUserStore((state) => state.user);
  const { onlineUsers } = usePersonalSocket({ id: info?.id ?? "" });
  return (
    <ul>
      {!isLoading && searchResults
        ? searchResults.map((user) => {
            return (
              <button
                onClick={() => openChat(user._id)}
                key={user._id}
                className="h-[60px] px-[10px] relative w-full items-center gap-[10px] flex flex-row border-b-[1px] border-[#333333] hover:bg-[#2E2F30] text-white cursor-pointer"
              >
                <img
                  src={user.profilePicture ? user.profilePicture : pp}
                  className="w-[50px] h-[50px] object-cover rounded-full"
                />
                <section className="flex flex-col justify-center">
                  <span className="text-[16px]">{user.login}</span>
                  <span className="text-[12px] text-[#9A9C99]">
                    {user.lastMessage}
                  </span>
                </section>
                {onlineUsers.includes(user._id) && (
                  <div className="absolute w-[10px] h-[10px] bg-green-600 rounded-full left-[45px] bottom-[5px]" />
                )}
              </button>
            );
          })
        : null}
    </ul>
  );
}
