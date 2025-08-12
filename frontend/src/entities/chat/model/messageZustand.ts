import { create } from "zustand";
import type { MessageSchema } from "../ui/components/messages/ui/components/message-bubble/model/types";

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
