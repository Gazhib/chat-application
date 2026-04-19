import { getCompanion } from "@/entities/messages/model/useCompanionQuery";
import { useMessages } from "@/entities/messages/model/useMessages";
import { useUserStore } from "@/entities/user/model/userZustand";
import { socket } from "@/util/model/socket";
import { apiUrl } from "@/util/model/api";
import { useParams } from "react-router";

export const useChatHeader = () => {
  const { chatId } = useParams();

  const companionId = useUserStore((state) => state.companionId);
  const setCallee = useUserStore((state) => state.setCallee);
  const setRoomId = useUserStore((state) => state.setRoomId);

  const { sendMessage } = useMessages();
  const handleCall = async () => {
    const response = await fetch(`${apiUrl}/calls`, {
      method: "POST",
      body: JSON.stringify({ companionId }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return;
    }

    const { roomId }: { roomId: string } = await response.json();
    await sendMessage({
      typed: roomId,
      roomId,
      chatId: chatId ?? "",
      picture: undefined,
      type: "call",
    });

    setRoomId(roomId);

    const companion = await getCompanion(chatId ?? "");
    setCallee(companion);

    socket.emit("startCall", { calleeId: companion._id, roomId });
  };

  return { handleCall };
};

