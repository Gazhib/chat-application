import { useParams } from "react-router";
import ChatHeader from "./chat-components/chat-header/Chatheader";
import ChatInput from "./chat-components/chat-input/ChatInput";
import { useState } from "react";
import { useMessages } from "../model/useMessages";
import Messages from "./chat-components/chat-messages/ui/Messages";
import { useUserStore } from "../../user/model/userZustand";
import { ProfileModal } from "../../user/ui/ProfileModal";
import { useSidebar } from "../../../widget/extended-sidebar/model/useSidebar";

export default function Chat() {
  const { chatId } = useParams();
  const { messages, isLoading, companion, sendMessage } = useMessages({
    chatId: chatId ?? "",
  });
  const { modalRef } = useSidebar();

  const [typed, setTyped] = useState("");
  const info = useUserStore((state) => state.user);

  const [currentUserModal, setCurrentUserModal] = useState("me");

  const handleSendMessage = () => {
    if (typed === "") return;
    sendMessage({
      typed,
      chatId: chatId || "",
      senderId: info?.id ?? "",
    });
    setTyped("");
  };

  return (
    <section className="h-screen flex flex-col bg-[#1E1F22]">
      <ChatHeader companionInfo={companion} myId={info?.id ?? ""} />
      <main className="flex-1 w-[calc(100vw-290px)] min-h-0 max-h-[calc(100vh-110px)] flex flex-col px-[20px] py-[10px] pb-[20px] overflow-y-auto gap-[10px]">
        <Messages
          isLoading={isLoading}
          messages={messages}
          myId={info?.id}
          companion={companion}
          setCurrentUserModal={setCurrentUserModal}
        />
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
