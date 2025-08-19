import { Outlet } from "react-router";
import { useEffect } from "react";
import { usePersonalSocket } from "@/util/model/socket/usePersonalSocket";
import { useUserStore } from "@/entities/user/model/userZustand";
import { useKeyStore } from "@/util/model/store/zustand";
import ChatSidebar from "@/entities/user-list/ui/ChatSidebar";

export default function ChatsPage() {
  const user = useUserStore((state) => state.user);
  usePersonalSocket({ id: user?._id ?? "" });

  const generateKeyPairs = useKeyStore((state) => state?.getKeyPairs);

  useEffect(() => {
    async function genKeyPairs() {
      generateKeyPairs();
    }
    genKeyPairs();
  }, [user?._id]);

  return (
    <main className="ml-[50px] h-screen bg-[#18191A] w-[calc(100%-50px)] flex flex-row">
      <ChatSidebar />
      <Outlet />
    </main>
  );
}
