import { useParams } from "react-router";
import ChatHeader from "./chat-components/chat-header/Chatheader";
import ChatInput from "./chat-components/chat-input/ChatInput";
import { useState } from "react";
import { useUserStore } from "../../../util/model/store/zustand";
import { useMessages } from "../model/useMessages";
import Messages from "./chat-components/chat-messages/ui/Messages";

export default function Chat() {
  const { chatId } = useParams();
  const { sendMessage, messages, isLoading, sharedKey, companion } =
    useMessages({
      chatId: chatId ?? "",
    });

  const [typed, setTyped] = useState("");
  const info = useUserStore((state) => state.user);

  const handleSendMessage = () => {
    if (typed === "") return;
    sendMessage({
      typed,
      chatId: chatId || "",
      senderId: info?.id ?? "",
      sharedKey,
    });
    setTyped("");
  };

  return (
    <section className="h-screen flex flex-col bg-[#1E1F22]">
      <ChatHeader companionInfo={companion} myId={info?.id ?? ""} />
      <main className="flex-1 w-[calc(100vw-290px)] min-h-0 max-h-[calc(100vh-110px)] flex flex-col px-[20px] py-[10px] pb-[20px] overflow-y-auto gap-[10px]">
        <Messages isLoading={isLoading} messages={messages} myId={info?.id} />
      </main>
      <ChatInput
        handleTyped={(value: string) => setTyped(value)}
        typed={typed}
        handleSendMessage={handleSendMessage}
      />
    </section>
  );
}
