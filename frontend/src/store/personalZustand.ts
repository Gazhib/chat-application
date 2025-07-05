import { create } from "zustand";
import { getKeyPair } from "../features/functions";

const useStore = create((set) => ({
  keyPairs: null,
  getKeyPairs: async () => {
    const keys = await getKeyPair();
    set({ keyPairs: keys });
  },
  sharedKey: null,
  changeSharedKey: async (newSharedKey: CryptoKey) => {
    set({ sharedKey: newSharedKey });
  },
}));

export default useStore;
