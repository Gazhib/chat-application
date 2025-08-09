import pp from "/pp.png";
import { usePersonalSocket } from "../../../../../../../util/model/socket/usePersonalSocket";
import { useChatSidebar, type User } from "../../model/useChatSidebar";

interface ChatList {
  typed: string;
  searchResults: User[];
}

export default function ChatList({ typed, searchResults }: ChatList) {
  const { user, users, isLoading, openChat, isSearchResultsLoading } =
    useChatSidebar();

  const { onlineUsers } = usePersonalSocket({ id: user?.id ?? "" });
  return (
    <ul>
      {!typed && !isLoading && users
        ? users.map((curUser) => {
            return (
              <button
                onClick={() => openChat(curUser.id)}
                key={curUser.id}
                className="h-[60px] px-[10px] relative w-full items-center gap-[10px] flex flex-row border-b-[1px] border-[#333333] hover:bg-[#2E2F30] text-white cursor-pointer"
              >
                <img
                  src={curUser.profilePicture ? curUser.profilePicture : pp}
                  className="w-[50px] h-[50px] object-cover rounded-full"
                />
                <section className="flex flex-col truncate">
                  <span className="text-[16px] self-start">
                    {curUser.login}
                  </span>
                  <div className="text-[12px] text-[#9A9C99] self-start flex flex-row gap-[5px]">
                    {curUser.lastMessage.picture && (
                      <img
                        src={curUser.lastMessage.picture}
                        className="w-[15px] h-[15px] object-cover"
                      />
                    )}
                    <span>{curUser?.lastMessage?.meta}</span>
                  </div>
                </section>
                {onlineUsers.includes(curUser.id) && (
                  <div className="absolute w-[10px] h-[10px] bg-green-600 rounded-full left-[45px] bottom-[5px]" />
                )}
              </button>
            );
          })
        : null}
      {typed && !isSearchResultsLoading && searchResults
        ? searchResults.map((curUser) => {
            return (
              <button
                onClick={() => openChat(curUser.id)}
                key={curUser.id}
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
                {onlineUsers.includes(curUser.id) && (
                  <div className="absolute w-[10px] h-[10px] bg-green-600 rounded-full left-[45px] bottom-[5px]" />
                )}
              </button>
            );
          })
        : null}
    </ul>
  );
}
