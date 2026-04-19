import { Outlet } from "react-router";
import { ProfileModal } from "./entities/user/ui/ProfileModal";
import { useUserStore } from "./entities/user/model/userZustand";
import { useEffect, useState } from "react";
import { Sidebar } from "./widget/sidebar/ui/Sidebar";
import { socket } from "./util/model/socket";

export default function CurrentPage() {
  const user = useUserStore((state) => state.user);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    if (!socket.connected) socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  return (
    <>
      <div className="flex min-h-[100dvh] max-w-full">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <ProfileModal
        user={user}
        handleCancel={() => setIsProfileModalOpen(false)}
        isModalOpen={isProfileModalOpen}
      />
    </>
  );
}
