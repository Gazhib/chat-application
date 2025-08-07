import ChatList from "./chat-sidebar-components/ChatList";
import SearchInput from "./chat-sidebar-components/SearchInput";
import { useChatSidebar } from "../model/useChatSidebar";

export default function ChatSidebar() {
  const { setTyped, typed, searchResults } = useChatSidebar();

  return (
    <aside className="w-[240px] h-full bg-[#242526] border-r-[1px] border-[#333333]">
      <header className="h-[60px] border-b-[1px] border-[#333333] w-full flex justify-center items-center">
        <SearchInput setTyped={setTyped} />
      </header>
      <ChatList typed={typed} searchResults={searchResults ?? []} />
    </aside>
  );
}
