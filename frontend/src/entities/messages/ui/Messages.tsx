import type { MessageSchema } from "./message-bubble/model/types";
import type { userInfo } from "@/entities/user/model/userZustand";
import MessageBubble from "./message-bubble/ui/MessageBubble";
import LoadingSpinner from "@/shared/spinner/ui/LoadingSpinner";
import { useChatHeader } from "@/entities/chat/ui/header/model/useChatHeader";
import { useEffect } from "react";

interface Messages {
  isLoading: boolean;
  messages: MessageSchema[];
  userId?: string;
  companion: userInfo;
  setCurrentUserModal?: (value: string) => void;
}

export default function Messages({
  isLoading,
  messages,
  userId = "",
  companion,
  setCurrentUserModal,
}: Messages) {
  const { handleCall } = useChatHeader();

  useEffect(() => {
    console.log(isLoading);
  }, [isLoading]);

  return (
    <main className="flex-1 w-full flex flex-col gap-[10px]">
      {isLoading && <LoadingSpinner />}
      {messages &&
        messages.map((message, index) => {
          if (!message) return;

          return (
            <MessageBubble
              setCurrentUserModal={setCurrentUserModal}
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
