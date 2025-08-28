import { useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "../model/useMessages";
import { useSidebar } from "@/widget/extended-sidebar/model/useSidebar";
import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import { ProfileModal } from "@/entities/user/ui/ProfileModal";
import ChatInput from "./input/ChatInput";
import Messages from "@/entities/messages/ui/Messages";
import ChatHeader from "./header/Chatheader";
import { useKeyStore } from "@/util/model/store/zustand";

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
  } = useMessages({
    chatId: chatId ?? "",
  });
  const { modalRef } = useSidebar();

  const [typed, setTyped] = useState("");
  const user = useUserStore((state) => state.user);

  const [currentUserModal, setCurrentUserModal] = useState("me");

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
    handleDecrypting();
  }, [chatId, user, keyPairs, data?.pages.length]);

  return (
    <section className="h-screen flex flex-col bg-[#1E1F22]">
      <ChatHeader
        companionInfo={companion as userInfo}
        userId={user?._id ?? ""}
      />
      <main
        onScroll={handleScroll}
        ref={messagesRef}
        className="flex-1 w-[calc(100vw-290px)] min-h-0 max-h-[calc(100vh-110px)] flex flex-col px-[20px] py-[10px] pb-[20px] overflow-y-auto gap-[10px]"
      >
        <Messages
          isLoading={isFetchingNextPage}
          messages={messages}
          userId={user?._id}
          companion={companion as userInfo}
          setCurrentUserModal={setCurrentUserModal}
        />
        <div ref={bottomRef} />
      </main>
      <ChatInput
        handleTyped={(value: string) => setTyped(value)}
        typed={typed}
        handleSendMessage={handleSendMessage}
      />
      <ProfileModal
        user={currentUserModal === "me" ? user : companion}
        ref={modalRef}
      />
    </section>
  );
}
