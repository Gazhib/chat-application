import { create } from "zustand";
import type { MessageSchema } from "@/entities/messages/ui/message-bubble/model/types";

interface messageStoreState {
  messages: MessageSchema[];
  setMessages: (messages: MessageSchema[]) => void;
  pagination: number;
  increasePagination: () => void;
  addSingleMessage: (message: MessageSchema) => void;
  addMessages: (messages: MessageSchema[]) => void;
}

export const useMessageStore = create<messageStoreState>((set) => ({
  messages: [],
  setMessages: (messages: MessageSchema[]) => {
    set({ messages });
  },
  addSingleMessage: (message: MessageSchema) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  addMessages: (messages: MessageSchema[]) => {
    set((state) => ({ messages: [...messages, ...state.messages] }));
  },
  pagination: 1,
  increasePagination: () => {
    set((state) => {
      console.log("pagination", state.pagination);
      return { pagination: state.pagination + 1 };
    });
  },
}));
