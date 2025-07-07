import { create } from "zustand";
import { getKeyPair } from "../features/functions";

interface StoreState {
  keyPairs?: {
    privateKey: CryptoKey;
  };
  sharedKey?: CryptoKey;
  getKeyPairs: () => void;
  changeSharedKey: (key: CryptoKey) => void;
}

const useStore = create<StoreState>((set) => ({
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

export default useStore;
