import { useNavigate, useParams } from "react-router";
import ChatHeader from "./Chatheader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useQuery } from "@tanstack/react-query";

export default function Chat() {
  const { directId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [directId],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/get-messages", {
        method: "POST",
        body: JSON.stringify({ directId }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        navigate("/chats");
      }

      const responseData = await response.json();
      return responseData.messages;
    },
  });


  return (
    <section className="h-full flex flex-col flex-1 bg-[#1E1F22]">
      <ChatHeader name="John" status="Online" />
      <main className="h-[calc(100%-110px)] flex flex-col justify-end px-[20px] pb-[20px] overflow-y-auto">
        {data
          ? data.map((message) => {
              return <MessageBubble message={message} place={"right"} />;
            })
          : null}
      </main>
      <ChatInput />
    </section>
  );
}
