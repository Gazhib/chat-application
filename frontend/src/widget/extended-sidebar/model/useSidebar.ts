import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSidebarStore } from "./sidebarZustand";
import type { modalRefScheme } from "@/shared/modal/ui/Modal";
import { authPort } from "@/util/ui/ProtectedRoutes";

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
