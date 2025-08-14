import { create } from "zustand";

export type userInfo = {
  email: string;
  login: string;
  role: string;
  _id: string;
  profilePicture?: string;
  description?: string;
};

interface userStoreState {
  user: userInfo | undefined;
  setUser: (user: userInfo | undefined) => void;
  companionId: string;
  setCompanionId: (companionId: string) => void;
}

export const useUserStore = create<userStoreState>((set) => ({
  user: undefined,
  setUser: (user: userInfo | undefined) => {
    set({ user: user });
  },
  companionId: "",
  setCompanionId: (companionId: string) => {
    set({ companionId: companionId });
  },
}));
