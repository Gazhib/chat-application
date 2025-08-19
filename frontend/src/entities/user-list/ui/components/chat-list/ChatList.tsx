import { usePersonalSocket } from "@/util/model/socket/usePersonalSocket";
import { useChatSidebar, type User } from "../../../model/useChatSidebar";
import List from "./components/List";

interface ChatList {
  typed: string;
  searchResults: User[];
}

export default function ChatList({ typed, searchResults }: ChatList) {
  const { user, users, openChat } = useChatSidebar();

  const { onlineUsers } = usePersonalSocket({ id: user?._id ?? "" });
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
