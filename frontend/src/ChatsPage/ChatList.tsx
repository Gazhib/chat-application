import { useNavigate } from "react-router";
import pp from "/pp.png";
import { useQuery } from "@tanstack/react-query";
export default function ChatList() {
  const { data, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/get-users", {
        method: "GET",
        credentials: "include",
      });
      const responseData = await response.json();

      return responseData;
    },
  });

  const navigate = useNavigate();

  const openChat = async (otherUserId: string) => {
    const response = await fetch(
      `http://localhost:3000/chats/direct/${otherUserId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = await response.json();
    navigate(`/chats/direct/${responseData.chatId}`);
  };

  return (
    <ul>
      {data
        ? data.map((user) => {
            return (
              <button
                onClick={() => openChat(user._id)}
                key={user.id}
                className="h-[60px] w-full items-center gap-[10px] flex flex-row border-b-[1px] border-[#333333] hover:bg-[#2E2F30] text-white cursor-pointer"
              >
                <img
                  src={user.photo}
                  className="w-[50px] h-[50px] object-cover rounded-full"
                />
                <section className="flex flex-col justify-center">
                  <span className="text-[16px]">{user.login}</span>
                  <span className="text-[12px] text-[#9A9C99]">
                    {user.lastMessage}
                  </span>
                </section>
              </button>
            );
          })
        : null}
    </ul>
  );
}
