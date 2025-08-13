import { motion } from "framer-motion";
import { useUserStore } from "@/entities/user/model/userZustand";
import { pp } from "@/entities/user/model/useUser";
import ProfileButton from "./components/elements/ProfileButton";
import ChatsButton from "./components/elements/ChatsButton";
import LogoutButton from "./components/elements/LogoutButton";
import { useSidebar } from "../model/useSidebar";

export const ExtendedSidebar = ({}) => {
  const user = useUserStore((state) => state.user);

  const {
    handleExtension,
    handleLogout,
    handleNavigateChats,
    handleOpenModal,
    clickRef,
  } = useSidebar();

  const handleProfile = () => {
    handleExtension();
    handleOpenModal();
  };

  return (
    <motion.aside
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
      ref={clickRef}
      className={`h-full transform transition-all duration-300 fixed z-51 w-[320px] bg-[#222222] text-[28px] text-white flex flex-col justify-between py-[10px]`}
    >
      <section className="flex flex-col h-full">
        <ProfileButton user={user!} pp={pp} handleProfile={handleProfile} />
        <ChatsButton handleNavigateChats={handleNavigateChats} />
      </section>
      <footer>
        <LogoutButton handleLogout={handleLogout} />
      </footer>
    </motion.aside>
  );
};
