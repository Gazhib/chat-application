import { useEffect, useRef } from "react";
import LoadingSpinner from "../../../../../../shared/spinner/ui/LoadingSpinner";
import type { MessageSchema } from "../../message-bubble/model/types";
import MessageBubble from "../../message-bubble/ui/MessageBubble";

interface Messages {
  isLoading: boolean;
  messages: MessageSchema[];
  myId?: string;
}

export default function Messages({ isLoading, messages, myId = "" }: Messages) {
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
              key={`${message.createdAt}-${message.meta}-${index}`}
              message={message.meta}
              place={message.senderId !== myId ? "left" : "right"}
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
