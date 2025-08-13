import { Outlet } from "react-router";
import { Sidebar } from "./widget/sidebar/ui/Sidebar";
import { AnimatePresence } from "framer-motion";
import { ProfileModal } from "./entities/user/ui/ProfileModal";
import { useUserStore } from "./entities/user/model/userZustand";
import { ExtendedSidebar } from "./widget/extended-sidebar/ui/ExtendedSidebar";
import { useSidebarStore } from "./widget/extended-sidebar/model/sidebarZustand";

export default function CurrentPage() {
  const user = useUserStore((state) => state.user);
  const { isExtended, modalRef } = useSidebarStore((state) => state);
  return (
    <>
      <AnimatePresence mode="wait">
        {isExtended && <ExtendedSidebar />}
      </AnimatePresence>
      <Sidebar />
      <Outlet />
      <ProfileModal user={user} ref={modalRef} />
    </>
  );
}
