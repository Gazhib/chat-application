import { Outlet } from "react-router";
import Sidebar from "../ChatsPage/Sidebar";
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
      await generateKeyPairs();
    }
    genKeyPairs();
  }, [user.id]);

  return (
    <main className="h-full bg-[#18191A] flex flex-row">
      <Sidebar />
      <Outlet />
    </main>
  );
}
