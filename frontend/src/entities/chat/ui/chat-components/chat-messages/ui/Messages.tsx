import { useEffect, useRef } from "react";
import LoadingSpinner from "../../../../../../shared/spinner/ui/LoadingSpinner";
import type { MessageSchema } from "../../message-bubble/model/types";
import MessageBubble from "../../message-bubble/ui/MessageBubble";
import type { userInfo } from "../../../../../user/model/userZustand";

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
