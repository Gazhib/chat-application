import { useEffect, useRef } from "react";
import type { MessageSchema } from "./components/message-bubble/model/types";
import type { userInfo } from "@/entities/user/model/userZustand";
import MessageBubble from "./components/message-bubble/ui/MessageBubble";
import LoadingSpinner from "@/shared/spinner/ui/LoadingSpinner";

interface Messages {
  isLoading: boolean;
  messages: MessageSchema[];
  myId?: string;
  companion: userInfo;
  setCurrentUserModal?: (value: string) => void;
}

export default function Messages({
  isLoading,
  messages,
  myId = "",
  companion,
  setCurrentUserModal,
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
              setCurrentUserModal={setCurrentUserModal}
              messageId={message._id}
              key={`${message.createdAt}-${message.meta}-${index}`}
              message={message}
              place={message.senderId !== myId ? "left" : "right"}
              companion={companion}
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
