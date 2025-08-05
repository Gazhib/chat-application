import { Outlet } from "react-router";
import { Sidebar } from "./widget/sidebar/ui/Sidebar";
import { useSidebar } from "./widget/extended-sidebar/model/useSidebar";
import { AnimatedExtendedSidebar } from "./widget/extended-sidebar/ui/ExtendedSidebar";
import { AnimatePresence } from "framer-motion";
import { ProfileModal } from "./entities/user/ui/ProfileModal";
import { useUserStore } from "./entities/user/model/userZustand";

export default function CurrentPage() {
  const {
    isExtended,
    handleExtension,
    handleLogout,
    modalRef,
    handleOpenModal,
  } = useSidebar();
  const user = useUserStore((state) => state.user);
  return (
    <>
      <AnimatePresence mode="wait">
        {isExtended && (
          <AnimatedExtendedSidebar
            handleExtension={handleExtension}
            handleLogout={handleLogout}
            handleOpenModal={handleOpenModal}
            key="extended-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -1000 }}
            transition={{
              x: {
                type: "tween",
                bounce: 0,
                ease: "linear",
                duration: 0.1,
              },
            }}
          />
        )}
      </AnimatePresence>
      <Sidebar key="sidebar" handleExtension={handleExtension} />
      <Outlet />
      <ProfileModal user={user} ref={modalRef} />
    </>
  );
}
