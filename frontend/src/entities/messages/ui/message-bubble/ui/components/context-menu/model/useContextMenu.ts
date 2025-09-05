import { socket } from "@/util/model/socket/socket";
import { port } from "@/util/ui/ProtectedRoutes";
import { useState } from "react";
import { useParams } from "react-router";

interface contextMenu {
  messageId: string;
}

export const useContextMenu = ({ messageId }: contextMenu) => {
  const [isContextMenu, setIsContextMenu] = useState(false);
  const { chatId } = useParams();

  const [editedMessage] = useState();

  const handleDelete = async () => {
    socket.emit("deleteMessage", { messageId, chatId });

    await fetch(`${port}/messages/${messageId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleEdit = async () => {
    socket.emit("editMessage", { messageId, chatId, editedMessage });

    await fetch(`${port}/edit-message`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ messageId, editedMessage }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const options = [
    {
      label: "Delete message",
      onClick: () => handleDelete(),
    },
    {
      label: "Edit message",
      onClick: () => handleEdit(),
    },
  ];

  const handleClick = () => {
    setIsContextMenu((prev) => !prev);
  };

  return { isContextMenu, handleClick, options };
};
