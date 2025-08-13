import { createRef } from "react";
import { create } from "zustand";

interface CallStore {
  isAudio: boolean;
  isVideo: boolean;
  setIsAudio: (value: boolean) => void;
  setIsVideo: (value: boolean) => void;
  userStream: React.RefObject<MediaStream>;
  senders: React.RefObject<RTCRtpSender[]>;
  isFinished: boolean;
  setIsFinished: (value: boolean) => void;
}

const initialState = {
  userStream: createRef<MediaStream>() as React.RefObject<MediaStream>,
  senders: { current: [] } as React.RefObject<RTCRtpSender[]>,
};

export const useCallStore = create<CallStore>((set) => ({
  isAudio: true,
  isVideo: true,
  setIsAudio: (value: boolean) => set({ isAudio: value }),
  setIsVideo: (value: boolean) => set({ isVideo: value }),
  isFinished: false,
  setIsFinished: (value: boolean) => {
    set({ isFinished: value });
  },
  ...initialState,
}));
