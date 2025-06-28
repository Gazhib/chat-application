import { Outlet } from "react-router";
import Sidebar from "../ChatsPage/Sidebar";

export default function ChatsPage() {
  return (
    <main className="h-full bg-[#18191A] flex flex-row">
      <Sidebar />
      <Outlet />
    </main>
  );
}
