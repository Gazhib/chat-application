import { useUserStore } from "@/entities/user/model/userZustand";
import { pp } from "@/entities/user/model/useUser";
import { useSidebar } from "@/widget/sidebar/model/useSidebar";
import Sider from "antd/es/layout/Sider";
import SidebarElement from "./SidebarElement";
import {
  ChatRoundUnreadLinear,
  HamburgerMenuLinear,
  Logout3Linear,
} from "solar-icon-set";
import { useState } from "react";
import { ProfileModal } from "@/entities/user/ui/ProfileModal";

export const Sidebar = ({}) => {
  const user = useUserStore((state) => state.user);

  const {
    toggleExtension,
    handleLogout,
    handleNavigateChats,
    isSidebarExtended,
  } = useSidebar();

  const isCollapsed = !isSidebarExtended;
  const profilePicture =
    user?.profilePicture && user.profilePicture !== "Empty"
      ? user.profilePicture
      : pp;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    toggleExtension(false);
  };

  return (
    <>
      <Sider
        width={286}
        collapsed={isCollapsed}
        collapsedWidth={88}
        trigger={null}
        className="!sticky !top-0 !z-1000 !h-[100dvh] !overflow-hidden !bg-[#1E1F22] !transition-[width] !duration-300"
      >
        <div className="flex h-full flex-col bg-[#1E1F22] px-3 py-4">
          <header
            className={`mb-4 flex items-center ${
              isCollapsed ? "justify-center" : "justify-between gap-3"
            }`}
          >
            <div
              aria-hidden={isCollapsed}
              className={`overflow-hidden transition-all duration-300 ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[170px] opacity-100"
              }`}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#8f949d]">
                Workspace
              </p>
              <h2 className="truncate pt-1 text-[20px] font-semibold text-white">
                Messages
              </h2>
            </div>

            <button
              type="button"
              onClick={() => toggleExtension()}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center text-white transition-all duration-300 hover:bg-[#555555]"
            >
              <HamburgerMenuLinear color="currentColor" size={22} />
            </button>
          </header>

          <section
            onClick={handleProfileClick}
            className={`flex items-center p-3 transition-all duration-300 hover:bg-[#555555] cursor-pointer ${
              isCollapsed ? "justify-center" : "justify-start"
            }`}
          >
            <div className="relative h-12 w-12 shrink-0">
              <img
                className="h-full w-full object-cover rounded-full"
                src={profilePicture}
                alt={user?.login ? `${user.login} profile` : "Profile picture"}
              />
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-[#22c55e]" />
            </div>

            <div
              aria-hidden={isCollapsed}
              className={`min-w-0 overflow-hidden transition-all duration-300 ${
                isCollapsed
                  ? "ml-0 max-w-0 opacity-0"
                  : "ml-3 max-w-[170px] opacity-100"
              }`}
            >
              <p className="truncate text-[16px] font-semibold text-white">
                {user?.login ?? "Your profile"}
              </p>
              <p className="truncate text-[12px] text-[#b7bcc7]">Online now</p>
            </div>
          </section>

          <section className="flex flex-1 flex-col">
            <div
              aria-hidden={isCollapsed}
              className={`px-2 pb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8f949d] transition-all duration-300 ${
                isCollapsed ? "max-h-0 opacity-0" : "max-h-8 opacity-100"
              }`}
            >
              Navigation
            </div>

            <SidebarElement
              onClick={handleNavigateChats}
              icon={<ChatRoundUnreadLinear color="currentColor" size={24} />}
              isCollapsed={isCollapsed}
              label="Chats"
              description="All conversations"
            />
          </section>

          <footer className="mt-auto pt-4">
            <SidebarElement
              onClick={handleLogout}
              icon={<Logout3Linear color="currentColor" size={24} />}
              isCollapsed={isCollapsed}
              label="Logout"
              description="Sign out safely"
            />
          </footer>
        </div>
      </Sider>
      <ProfileModal
        user={user}
        handleCancel={() => setIsProfileModalOpen(false)}
        isModalOpen={isProfileModalOpen}
      />
    </>
  );
};
