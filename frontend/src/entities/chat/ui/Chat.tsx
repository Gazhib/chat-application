import { useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "../../messages/model/useMessages";
import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import ChatInput from "./input/ChatInput";
import Messages from "@/entities/messages/ui/Messages";
import ChatHeader from "./header/Chatheader";
import { useKeyStore } from "@/util/model/zustand";

export default function Chat() {
  const { chatId } = useParams();
  const {
    messages,
    companion,
    handleDecrypting,
    sendMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data,
    readMessage,
  } = useMessages();

  const [typed, setTyped] = useState("");
  const user = useUserStore((state) => state.user);

  const keyPairs = useKeyStore((state) => state.keyPairs);

  const handleSendMessage = (previewUrl: string | undefined) => {
    if (typed === "" && previewUrl === undefined) return;

    sendMessage({
      typed,
      chatId: chatId || "",
      picture: previewUrl,
    });
    setTyped("");
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const handleScroll = async () => {
    const container = messagesRef.current;
    if (!container || isFetchingNextPage) return;

    if (container.scrollTop < 50 && hasNextPage) {
      const oldHeight = container.scrollHeight;
      await fetchNextPage();
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - oldHeight;
    }
  };

  useEffect(() => {
    if (bottomRef.current && !isFetchingNextPage) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!chatId || !user || !keyPairs) return;
    handleDecrypting();
  }, [chatId, user, keyPairs, data?.pages]);

  return (
    <section className="flex h-screen min-w-0 flex-1 flex-col bg-[#1E1F22]">
      <ChatHeader
        companionInfo={companion as userInfo}
        userId={user?._id ?? ""}
      />
      <main
        onScroll={handleScroll}
        ref={messagesRef}
        className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto px-[20px] py-[10px] pb-[20px]"
      >
        <Messages
          readMessage={readMessage}
          isLoading={isFetchingNextPage}
          messages={messages}
          userId={user?._id}
          companion={companion as userInfo}
        />
        <div ref={bottomRef} />
      </main>
      <ChatInput
        handleTyped={(value: string) => setTyped(value)}
        typed={typed}
        handleSendMessage={handleSendMessage}
      />
    </section>
  );
}
