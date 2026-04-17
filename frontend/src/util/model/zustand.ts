import { getKeyPair } from "@/entities/chat/model/encryption";
import { create } from "zustand";

interface KeyStoreState {
  keyPairs?: {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  };
  sharedKeys: Map<string, CryptoKey>;
  getKeyPairs: () => Promise<void>;
  setSharedKeyForChat: (chatId: string, key: CryptoKey) => void;
}

export const useKeyStore = create<KeyStoreState>((set) => ({
  keyPairs: undefined,
  sharedKeys: new Map(),

  getKeyPairs: async () => {
    const keys = await getKeyPair();
    set({ keyPairs: keys });
  },

  setSharedKeyForChat: (chatId: string, key: CryptoKey) => {
    set((state) => {
      const updated = new Map(state.sharedKeys);
      updated.set(chatId, key);
      return { sharedKeys: updated };
    });
  },
}));
