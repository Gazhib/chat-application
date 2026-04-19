import { socket } from "@/util/model/socket";
import { apiUrl } from "@/util/model/api";
import { useState } from "react";
import { useParams } from "react-router";

interface contextMenu {
  messageId: string;
}

export const useContextMenu = ({ messageId }: contextMenu) => {
  const [isContextMenu, setIsContextMenu] = useState(false);
  const { chatId } = useParams();

  const handleDelete = async () => {
    socket.emit("deleteMessage", { messageId, chatId });

    await fetch(`${apiUrl}/messages/${messageId}`, {
      method: "DELETE",
      credentials: "include",
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
    // {
    //   label: "Edit message",
    //   onClick: () => handleEdit(),
    // },
  ];

  const handleClickContextMenu = () => {
    setIsContextMenu((prev) => !prev);
  };

  return { isContextMenu, handleClickContextMenu, options };
};

