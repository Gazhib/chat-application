import { Outlet } from "react-router";
import Sidebar from "../ChatsPage/Sidebar";
import { socket } from "../socket";
import { useEffect } from "react";
import { useAppSelector } from "../store/hooks";

export default function ChatsPage() {
  const user = useAppSelector((state) => state.user);
  useEffect(() => {
    if (user.id !== "") {
      if (!socket.connected) {
        socket.connect();
      }
      return () => {
        socket.disconnect();
      };
    }
  }, [user.id]);

  return (
    <main className="h-full bg-[#18191A] flex flex-row">
      <Sidebar />
      <Outlet />
    </main>
  );
}
