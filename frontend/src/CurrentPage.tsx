import { Outlet } from "react-router";
import { ProfileModal } from "./entities/user/ui/ProfileModal";
import { useUserStore } from "./entities/user/model/userZustand";
import { useState } from "react";
import { Sidebar } from "./widget/sidebar/ui/Sidebar";

export default function CurrentPage() {
  const user = useUserStore((state) => state.user);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
