import { create } from "zustand";
import { createRef } from "react";
import type { modalRefScheme } from "@/shared/modal/ui/Modal";

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
