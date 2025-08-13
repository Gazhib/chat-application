import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useSidebarStore } from "./sidebarZustand";
import type { modalRefScheme } from "@/shared/modal/ui/Modal";
import { authPort } from "@/util/ui/ProtectedRoutes";

export const useSidebar = () => {
  const isExtended = useSidebarStore((state) => state.isExtended);
  const alterIsExtended = useSidebarStore((state) => state.alterIsExtended);
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

  const handleNavigateChats = async () => {
    window.location.href = "/chats";
  };

  const handleExtension = () => {
    alterIsExtended();
  };

  const handleOpenModal = () => {
    modalRef.current?.openModal();
  };

  const handleCloseModal = () => {
    modalRef.current?.closeModal();
  };

  const clickRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        clickRef.current &&
        !clickRef.current.contains(event.target as Node)
      ) {
        handleExtension();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return {
    isExtended,
    handleLogout,
    handleExtension,
    modalRef,
    handleCloseModal,
    handleOpenModal,
    handleNavigateChats,
    clickRef,
  };
};
