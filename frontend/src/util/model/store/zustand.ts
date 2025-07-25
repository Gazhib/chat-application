import { create } from "zustand";
import { getKeyPair } from "../../../entities/chat/model/encryption";

interface keyStoreState {
  keyPairs?: {
    privateKey: CryptoKey;
  };
  sharedKey?: CryptoKey;
  getKeyPairs: () => void;
  changeSharedKey: (key: CryptoKey) => void;
}

export const useKeyStore = create<keyStoreState>((set) => ({
  keyPairs: undefined,
  getKeyPairs: async () => {
    const keys = await getKeyPair();
    set({ keyPairs: keys });
  },
  sharedKey: undefined,
  changeSharedKey: async (key: CryptoKey) => {
    set({ sharedKey: key });
  },
}));

