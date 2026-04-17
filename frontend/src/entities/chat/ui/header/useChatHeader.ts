import { useMessages } from "@/entities/messages/model/useMessages";
import { useUserStore } from "@/entities/user/model/userZustand";
import { port } from "@/util/ui/ProtectedRoutes";
import { useParams } from "react-router";

export const useChatHeader = () => {
  const { chatId } = useParams();

  const companionId = useUserStore((state) => state.companionId);

  const { sendMessage } = useMessages();
  const handleCall = async () => {
    const response = await fetch(`${port}/calls`, {
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
    window.open(
      `${window.location.origin}/call/${roomId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return { handleCall };
};
