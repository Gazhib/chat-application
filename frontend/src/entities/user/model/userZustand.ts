import { create } from "zustand";

export type userInfo = {
  email: string;
  login: string;
  role: string;
  id: string;
  profilePicture?: string;
  description?: string;
};

interface userStoreState {
  user: userInfo | undefined;
  setUser: (user: userInfo | undefined) => void;
}

export const useUserStore = create<userStoreState>((set) => ({
  user: undefined,
  setUser: (user: userInfo | undefined) => {
    set({ user: user });
  },
}));
