import { useState } from "react";
import { port } from "../../../../../../../../util/ui/ProtectedRoutes";
import { socket } from "../../../../../../../../util/model/socket/socket";
import { useParams } from "react-router";

interface contextMenu {
  messageId: string;
}

export const useContextMenu = ({ messageId }: contextMenu) => {
  const [isContextMenu, setIsContextMenu] = useState(false);
  const { chatId } = useParams();

  const [editedMessage,] = useState();

  const handleDelete = async () => {
    socket.emit("deleteMessage", { messageId, chatId });

    const response = await fetch(`${port}/delete-message`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ messageId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(await response.json());
  };

  const handleEdit = async () => {
    socket.emit("editMessage", { messageId, chatId, editedMessage });

    const response = await fetch(`${port}/edit-message`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ messageId, editedMessage }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(await response.json());
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
