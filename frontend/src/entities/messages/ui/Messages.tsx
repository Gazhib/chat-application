import type { MessageSchema } from "./message-bubble/model/types";
import type { userInfo } from "@/entities/user/model/userZustand";
import MessageBubble from "./message-bubble/ui/MessageBubble";
import LoadingSpinner from "@/shared/spinner/ui/LoadingSpinner";

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



  return (
    <>
      {!isLoading && messages ? (
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
            />
          );
        })
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}
