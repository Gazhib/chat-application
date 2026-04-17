import { authPort } from "@/util/ui/ProtectedRoutes";
import { useState } from "react";
import { useNavigate } from "react-router";

export const useSidebar = () => {
  const [isSidebarExtended, setIsSidebarExtended] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch(`${authPort}/api/logout`, {
      method: "GET",
      credentials: "include",
    });
    navigate("/auth?mode=login");
  };

  const handleNavigateChats = async () => {
    window.location.href = "/chats";
  };

  const toggleExtension = (state?: boolean) => {

    if (state !== undefined) {
      setIsSidebarExtended(state);
      return;
    }

    setIsSidebarExtended((prev) => !prev);
  };


  return {
    isSidebarExtended,
    handleLogout,
    toggleExtension,
    handleNavigateChats,
  };
};
