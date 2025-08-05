import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { authPort } from "../../../util/ui/ProtectedRoutes";
import type { modalRefScheme } from "../../../entities/user/ui/ProfileModal";
import { useSidebarStore } from "./sidebarZustand";

export const useSidebar = () => {
  const [isExtended, setIsExtended] = useState(false);
  const modalRef =
    useSidebarStore((state) => state.modalRef) || useRef<modalRefScheme>(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch(`${authPort}/api/logout`, {
      method: "GET",
      credentials: "include",
    });
    navigate("/auth?mode=login");
  };

  const handleExtension = () => {
    setIsExtended((prev) => !prev);
  };

  const handleOpenModal = () => {
    modalRef.current?.openModal();
  };

  const handleCloseModal = () => {
    modalRef.current?.closeModal();
  };

  return {
    isExtended,
    handleLogout,
    handleExtension,
    modalRef,
    handleCloseModal,
    handleOpenModal,
  };
};
