import type { User } from "../../../../model/useChatSidebar";
import CLElement from "./ListElement";

interface ListScheme {
  onlineUsers: string[];
  openChat: (id: string, companionId: string) => void;
  users: User[];
}

export default function List({ onlineUsers, openChat, users }: ListScheme) {
  return (
    <ul>
      {users.map((curUser) => {
        return (
          <CLElement
            key={curUser._id}
            openChat={() => openChat(curUser.chatId, curUser._id)}
            login={curUser.login}
            profilePicture={curUser.profilePicture}
            lastMessage={curUser.lastMessage}
            isOnline={onlineUsers.includes(curUser._id)}
          />
        );
      })}
    </ul>
  );
}
