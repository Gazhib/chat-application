import { create } from "zustand";
import type { modalRefScheme } from "../../../entities/user/ui/ProfileModal";
import { createRef } from "react";

interface SidebarStore {
  modalRef: React.RefObject<modalRefScheme> | null;
}

const modalRef =
  createRef<modalRefScheme>() as React.RefObject<modalRefScheme> | null;

const initialState: SidebarStore = {
  modalRef,
};

export const useSidebarStore = create<SidebarStore>(() => ({
  ...initialState,
}));
