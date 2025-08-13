import { useRef, useState } from "react";
import { useCallStore } from "../../../model/callZustand";
import { socket } from "@/util/model/socket/socket";

export const useVideoToolbar = () => {
  const isAudio = useCallStore((state) => state.isAudio);
  const isVideo = useCallStore((state) => state.isVideo);
  const [isSharing, setIsSharing] = useState(false);

  const setIsAudio = useCallStore((state) => state.setIsAudio);
  const setIsVideo = useCallStore((state) => state.setIsVideo);

  const setIsFinished = useCallStore((state) => state.setIsFinished);

  const userStream = useCallStore((state) => state.userStream);
  const senders = useCallStore((state) => state.senders);

  const screenTrack = useRef<MediaStreamTrack>(null);

  const toggleAudio = () => {
    setIsAudio(!isAudio);
    const audioTrack = userStream.current
      .getTracks()
      .find((track) => track.kind === "audio");

    if (audioTrack!.enabled) {
      audioTrack!.enabled = false;
    } else {
      audioTrack!.enabled = true;
    }
  };

  const toggleVideo = () => {
    setIsVideo(!isVideo);
    const videoTrack = userStream.current
      .getTracks()
      .find((track) => track.kind === "video");

    if (videoTrack!.enabled) {
      videoTrack!.enabled = false;
    } else {
      videoTrack!.enabled = true;
    }
  };

  const shareScreen = async () => {
    const sender = senders.current.find(
      (sender) => sender.track?.kind === "video"
    );
    if (!sender) return;
    const stream = await navigator.mediaDevices.getDisplayMedia();
    screenTrack.current = stream.getTracks()[0];
    await sender?.replaceTrack(screenTrack.current);
    setIsSharing(true);
    screenTrack.current.onended = stopShareScreen;
  };

  const stopShareScreen = async () => {
    if (screenTrack.current) {
      screenTrack.current!.onended = null;
      screenTrack.current?.stop();
      setIsSharing(false);
      senders.current
        .find((sender) => sender.track?.kind === "video")
        ?.replaceTrack(userStream.current.getTracks()[1]);
    }
  };

  const hangUp = async () => {
    await stopShareScreen();
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => track.stop());
    }
    
    senders.current = [];
    setIsFinished(true);
    socket.emit("hangUp");
  };

  return {
    toggleAudio,
    toggleVideo,
    isAudio,
    isVideo,
    shareScreen,
    isSharing,
    stopShareScreen,
    hangUp,
  };
};
