import type { MessageSchema } from "./message-bubble/types";
import type { userInfo } from "@/entities/user/model/userZustand";
import MessageBubble from "./message-bubble/MessageBubble";
import { useChatHeader } from "@/entities/chat/ui/header/useChatHeader";
import LoadingSpinner from "@/shared/spinner/LoadingSpinner";

interface Messages {
  isLoading: boolean;
  messages: MessageSchema[];
  userId?: string;
  companion: userInfo;
  readMessage: (messageId: string) => Promise<void>;
}

export default function Messages({
  isLoading,
  messages,
  userId = "",
  companion,
  readMessage,
}: Messages) {
  const { handleCall } = useChatHeader();

  return (
    <main className="flex-1 w-full flex flex-col gap-[10px]">
      {isLoading && <LoadingSpinner />}
      {messages &&
        messages.map((message, index) => {
          if (!message) return;

          return (
            <MessageBubble
              readMessage={readMessage}
              messageId={message._id!}
              key={`${message.createdAt}-${message.meta}-${index}`}
              message={message}
              place={message.senderId !== userId ? "left" : "right"}
              companion={companion}
              handleCall={handleCall}
            />
          );
        })}
    </main>
  );
}
