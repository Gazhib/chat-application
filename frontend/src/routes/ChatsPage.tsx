import { Outlet } from "react-router";
import ChatSidebar from "../entities/chat/ui/chat-components/chat-sidebar/ui/ChatSidebar";
import { usePersonalSocket } from "../util/model/socket/usePersonalSocket";
import { useKeyStore } from "../util/model/store/zustand";
import { useEffect } from "react";
import { useUserStore } from "../entities/user/model/userZustand";

export default function ChatsPage() {
  const user = useUserStore((state) => state.user);
  const personalSocket = usePersonalSocket({ id: user?.id ?? "" });

  const generateKeyPairs = useKeyStore((state) => state?.getKeyPairs);

  useEffect(() => {
    async function genKeyPairs() {
      generateKeyPairs();
    }
    genKeyPairs();
  }, [user?.id]);

  return (
    <main className="ml-[50px] h-screen bg-[#18191A] w-[calc(100%-50px)] flex flex-row">
      <ChatSidebar />
      <Outlet />
    </main>
  );
}
