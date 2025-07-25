import { useEffect, useRef } from "react";
import LoadingSpinner from "../../../../../../shared/spinner/ui/LoadingSpinner";
import type { MessageSchema } from "../../message-bubble/model/types";
import MessageBubble from "../../message-bubble/ui/MessageBubble";

interface Messages {
  isLoading: boolean;
  messages: MessageSchema[];
  myId?: string;
  companion: { _id: string; login: string };
}

export default function Messages({
  isLoading,
  messages,
  myId = "",
  companion,
}: Messages) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {!isLoading && messages ? (
        messages.map((message, index) => {
          if (!message) return;
          return (
            <MessageBubble
              messageId={message._id}
              key={`${message.createdAt}-${message.meta}-${index}`}
              message={message}
              place={message.senderId !== myId ? "left" : "right"}
              companionLogin={companion.login}
            />
          );
        })
      ) : (
        <LoadingSpinner />
      )}
      <div ref={bottomRef} />
    </>
  );
}
