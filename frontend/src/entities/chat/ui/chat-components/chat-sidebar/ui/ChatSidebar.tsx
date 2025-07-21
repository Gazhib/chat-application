import { useState } from "react";
import ChatList from "./chat-sidebar-components/ChatList";
import SearchInput from "./chat-sidebar-components/SearchInput";

export default function ChatSidebar() {
  const [typed, setTyped] = useState<string>("");

  return (
    <aside className="w-[240px] h-full bg-[#242526] border-r-[1px] border-[#333333]">
      <header className="h-[60px] border-b-[1px] border-[#333333] w-full flex justify-center items-center">
        <SearchInput setTyped={setTyped} />
      </header>
      <ChatList typed={typed} />
    </aside>
  );
}
