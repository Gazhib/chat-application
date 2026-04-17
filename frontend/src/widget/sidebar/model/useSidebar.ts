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

  const handleExtension = () => {
    setIsSidebarExtended((prev) => !prev);
  };


  return {
    isSidebarExtended,
    handleLogout,
    handleExtension,
    handleNavigateChats,
  };
};
