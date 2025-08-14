import { useMessages } from "@/entities/chat/model/useMessages";
import { useNavigate, useParams } from "react-router";

export const useChatHeader = () => {
  const navigate = useNavigate();

  const { chatId } = useParams();

  const { sendMessage } = useMessages({ chatId: chatId ?? "" });
  const handleCall = async () => {
    const callId = crypto.randomUUID();
    // change it
    await sendMessage({
      typed: callId,
      chatId: chatId ?? "",
      picture: undefined,
    });
    navigate(`/call/${callId}`);
  };

  return { handleCall };
};
