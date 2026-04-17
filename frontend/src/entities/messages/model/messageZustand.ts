import { create } from "zustand";
import type { MessageSchema } from "@/entities/messages/ui/message-bubble/types";

interface messageStoreState {
  messages: MessageSchema[];
  setMessages: (messages: MessageSchema[]) => void;
  addSingleMessage: (message: MessageSchema) => void;
  addMessages: (messages: MessageSchema[]) => void;
  // Replaces a temporary client-side ID with the real server-assigned _id.
  // Used to reconcile optimistic messages after the POST /messages response.
  updateMessageId: (tempId: string, realId: string) => void;
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

  updateMessageId: (tempId: string, realId: string) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === tempId ? { ...msg, _id: realId } : msg
      ),
    }));
  },
}));
