import type { User } from "../../../../model/useChatSidebar";
import CLElement from "./ListElement";

interface ListScheme {
  onlineUsers: string[];
  openChat: (id: string) => void;
  users: User[];
}

export default function List({ onlineUsers, openChat, users }: ListScheme) {
  return (
    <ul>
      {users.map((curUser) => {
        return (
          <CLElement
            key={curUser.id}
            openChat={() => openChat(curUser.chatId)}
            login={curUser.login}
            profilePicture={curUser.profilePicture}
            lastMessage={curUser.lastMessage}
            isOnline={onlineUsers.includes(curUser.id)}
          />
        );
      })}
    </ul>
  );
}
