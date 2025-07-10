import { Outlet } from "react-router";
import { Sidebar } from "../shared/Sidebar";
import { useBurger } from "../features/hooks";
import { AnimatedExtendedSidebar } from "../shared/ExtendedSidebar";
import { AnimatePresence } from "framer-motion";

export default function CurrentPage() {
  const { isBurger, handleBurger, handleLogout } = useBurger();

  return (
    <>
      <AnimatePresence mode="wait">
        {isBurger && (
          <AnimatedExtendedSidebar
            handleBurger={handleBurger}
            handleLogout={handleLogout}
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
      <Sidebar key="sidebar" handleBurger={handleBurger} />
      <Outlet />
    </>
  );
}
