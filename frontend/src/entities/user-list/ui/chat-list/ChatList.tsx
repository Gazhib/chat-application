import { usePersonalSocket } from "@/util/model/usePersonalSocket";
import { useChatSidebar, type User } from "../../model/useChatSidebar";
import List from "./List";

interface ChatList {
  typed: string;
  searchResults: User[];
}

export default function ChatList({ typed, searchResults }: ChatList) {
  const { users, openChat } = useChatSidebar();

  const { onlineUsers } = usePersonalSocket();
  return (
    <ul>
      <List
        openChat={openChat}
        onlineUsers={onlineUsers}
        users={typed ? searchResults : users}
      />
    </ul>
  );
}
