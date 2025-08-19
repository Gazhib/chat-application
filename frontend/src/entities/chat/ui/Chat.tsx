import { useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "../model/useMessages";
import { useSidebar } from "@/widget/extended-sidebar/model/useSidebar";
import { useUserStore } from "@/entities/user/model/userZustand";
import { ProfileModal } from "@/entities/user/ui/ProfileModal";
import ChatInput from "./input/ChatInput";
import Messages from "@/entities/messages/ui/Messages";
import ChatHeader from "./header/Chatheader";

export default function Chat() {
  const { chatId } = useParams();
  const { messages, isLoading, companion, sendMessage } = useMessages({
    chatId: chatId ?? "",
  });
  const { modalRef } = useSidebar();

  const [typed, setTyped] = useState("");
  const info = useUserStore((state) => state.user);

  const [currentUserModal, setCurrentUserModal] = useState("me");

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

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <section className="h-screen flex flex-col bg-[#1E1F22]">
      <ChatHeader companionInfo={companion} userId={info?._id ?? ""} />
      <main className="flex-1 w-[calc(100vw-290px)] min-h-0 max-h-[calc(100vh-110px)] flex flex-col px-[20px] py-[10px] pb-[20px] overflow-y-auto gap-[10px]">
        <Messages
          isLoading={isLoading}
          messages={messages}
          userId={info?._id}
          companion={companion}
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
        user={currentUserModal === "me" ? info : companion}
        ref={modalRef}
      />
    </section>
  );
}
