import { create } from "zustand";
import { createRef } from "react";
import type { modalRefScheme } from "@/shared/modal/ui/Modal";

interface SidebarStore {
  isExtended: boolean;
  setIsExtended: (value: boolean) => void;
  modalRef: React.RefObject<modalRefScheme> | null;
  alterIsExtended: () => void;
}

const modalRef =
  createRef<modalRefScheme>() as React.RefObject<modalRefScheme> | null;

const initialState = {
  modalRef,
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isExtended: false,
  setIsExtended: (value: boolean) => {
    set({ isExtended: value });
  },
  alterIsExtended: () => {
    set((state) => ({ isExtended: !state.isExtended }));
  },
  ...initialState,
}));
