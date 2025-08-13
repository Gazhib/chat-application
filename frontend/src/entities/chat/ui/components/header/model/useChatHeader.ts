import { useMessages } from "@/entities/chat/model/useMessages";
import { useUserStore } from "@/entities/user/model/userZustand";
import { useNavigate, useParams } from "react-router";

export const useChatHeader = () => {
  const navigate = useNavigate();

  const { chatId } = useParams();

  const { sendMessage } = useMessages({ chatId: chatId ?? "" });
  const user = useUserStore((state) => state.user);
  const handleCall = async () => {
    const callId = crypto.randomUUID();
    await sendMessage({
      typed: callId,
      chatId: chatId ?? "",
      senderId: user?.id ?? "",
      picture: undefined,
      type: "call",
    });
    navigate(`/call/${callId}`);
  };

  return { handleCall };
};
