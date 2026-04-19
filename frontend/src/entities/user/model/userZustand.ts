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
  callee: userInfo | null;
  setCallee: (callee: userInfo | null) => void;
  roomId?: string;
  setRoomId: (roomId: string | undefined) => void;
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
  callee: null,
  setCallee: (callee: userInfo | null) => {
    set({ callee });
  },
  roomId: undefined,
  setRoomId: (roomId: string | undefined) => {
    set({ roomId });
  },
}));
