import { create } from "zustand";
import type { MessageSchema } from "../ui/chat-components/message-bubble/model/types";

interface messageStoreState {
  messages: MessageSchema[];
  setMessages: (messages: MessageSchema[]) => void;
}

export const useMessageStore = create<messageStoreState>((set) => ({
  messages: [],
  setMessages: (messages: MessageSchema[]) => {
    set({ messages });
  },
}));
