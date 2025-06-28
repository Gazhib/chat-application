import { useParams } from "react-router";
import ChatHeader from "./Chatheader";
import ChatInput from "./ChatInput";

export default function Chat() {
  const { chatId } = useParams();
  console.log(chatId);
  return (
    <section className="h-screen flex flex-col flex-1 bg-[#1E1F22]">
      <ChatHeader name="John" status="Online" />
      <div className="h-screen">{chatId}</div>
      <ChatInput />
    </section>
  );
}
