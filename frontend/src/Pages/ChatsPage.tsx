import { Outlet } from "react-router";
import ChatSidebar from "../ChatsPage/ChatSidebar";
import { useAppSelector } from "../store/hooks";
import { usePersonalSocket } from "../features/hooks";
import useStore from "../store/personalZustand";
import { useEffect } from "react";

export default function ChatsPage() {
  const user = useAppSelector((state) => state.user);
  const personalSocket = usePersonalSocket(user.id);

  const generateKeyPairs = useStore((state) => state?.getKeyPairs);

  useEffect(() => {
    async function genKeyPairs() {
      generateKeyPairs();
    }
    genKeyPairs();
  }, [user.id]);

  return (
    <main className="ml-[50px] h-screen bg-[#18191A] w-[calc(100%-50px)] flex flex-row">
      <ChatSidebar />
      <Outlet />
    </main>
  );
}
