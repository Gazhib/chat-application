import { useParams } from "react-router";
import ChatHeader from "./Chatheader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

export default function Chat() {
  const { chatId } = useParams();
  console.log(chatId);
  const messages = ["hello", "wassup"];
  return (
    <section className="h-full flex flex-col flex-1 bg-[#1E1F22]">
      <ChatHeader name="John" status="Online" />
      <main className="h-[calc(100%-110px)] flex flex-col justify-end px-[20px] pb-[20px] overflow-y-auto">
        {messages.map((message, index) => {
          const place = index === 0 ? "right" : "left"
          return <MessageBubble message={message} place={place} />;
        })}
      </main>
      <ChatInput />
    </section>
  );
}
