import { useMessageStore } from "@/entities/messages/model/messageZustand";
import { useUserStore } from "@/entities/user/model/userZustand";
import { socket } from "@/util/model/socket";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useVideoToolbar } from "../ui/Toolbar/model/useVideoToolbar";
import { useCallStore } from "./callZustand";
type payload = {
  target: string | undefined;
  caller: string | undefined;
  sdp: RTCSessionDescription | undefined | null;
};
export const useVideoChat = () => {
  const userVideo = useRef<HTMLVideoElement>(null);

  const userStream = useCallStore((state) => state.userStream);

  const companionVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection>(null);
  const otherUser = useRef<string>(null);

  const isFinished = useCallStore((state) => state.isFinished);
  const setIsFinished = useCallStore((state) => state.setIsFinished);

  const { stopShareScreen } = useVideoToolbar();

  const senders = useCallStore((state) => state.senders);

  const { callId } = useParams();

  const messages = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.setMessages);

  const handleNegotiationNeededEvent = (userId?: string) => {
    peerRef.current
      ?.createOffer()
      .then((offer) => {
        return peerRef.current?.setLocalDescription(offer);
      })
      .then(() => {
        const payload: payload = {
          target: userId,
          caller: socket.id,
          sdp: peerRef.current?.localDescription,
        };

        socket.emit("offer", payload);
      })
      .catch((e) => console.log(e));
  };

  const createPeer = (userId?: string) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userId);
    return peer;
  };

  const handleReceiveCall = (incoming: payload) => {
    peerRef.current = createPeer(incoming.caller);
    const desc = new RTCSessionDescription(incoming.sdp!);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current
          ?.getTracks()
          .forEach((track) =>
            peerRef.current?.addTrack(track, userStream.current!)
          );
      })
      .then(() => {
        return peerRef.current?.createAnswer();
      })
      .then((answer) => {
        return peerRef.current?.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socket.id,
          sdp: peerRef.current?.localDescription,
        };
        socket.emit("answer", payload);
      });
  };

  const handleAnswer = (message: payload) => {
    const desc = new RTCSessionDescription(message.sdp!);
    peerRef.current?.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleICECandidateEvent = (e: RTCPeerConnectionIceEvent) => {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socket.emit("ice-candidate", payload);
    }
  };

  const handleNewICECandidateMsg = (incoming: RTCIceCandidateInit) => {
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current?.addIceCandidate(candidate).catch((e) => console.log(e));
  };

  const handleTrackEvent = (e: RTCTrackEvent) => {
    if (companionVideo.current) companionVideo.current.srcObject = e.streams[0];
  };

  const callUser = (userId: string) => {
    peerRef.current = createPeer(userId);
    userStream.current
      ?.getTracks()
      .forEach((track) =>
        senders.current.push(
          peerRef.current?.addTrack(track, userStream.current!)!
        )
      );
  };

  const onOtherUser = (userId: string) => {
    callUser(userId);
    otherUser.current = userId;
  };

  const onUserJoined = (userId: string) => {
    otherUser.current = userId;
  };

  const onUserLeft = async () => {
    await stopShareScreen();
    userStream.current?.getTracks().forEach((track) => track.stop());
    senders.current = [];
    peerRef.current = null;
    const updatedMessages = messages.map((msg) =>
      msg.messageType !== "call"
        ? msg
        : msg.finishedAt
        ? msg
        : {
            ...msg,
            finishedAt: new Date().toLocaleTimeString().slice(0, 5),
          }
    );
    setMessages(updatedMessages);
    window.close();
    setIsFinished(true);
  };

  const setCallee = useUserStore((state) => state.setCallee);

  useEffect(() => {
    socket.on("otherUser", onOtherUser);

    socket.on("userJoined", onUserJoined);

    socket.on("offer", handleReceiveCall);

    socket.on("answer", handleAnswer);

    socket.on("ice-candidate", handleNewICECandidateMsg);

    socket.on("userLeft", onUserLeft);

    socket.on("callDeclined", () => {
      userStream.current?.getTracks().forEach((t) => t.stop());
      peerRef.current?.close();
      setIsFinished(true);
      setCallee(null);
    });

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (userVideo.current) userVideo.current.srcObject = stream;
        userStream.current = stream;
        socket.emit("call", callId);
      });
    return () => {
      socket.off("otherUser", onOtherUser);
      socket.off("userJoined", onUserJoined);
      socket.off("offer", handleReceiveCall);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleNewICECandidateMsg);
      userStream.current?.getTracks().forEach((track) => track.stop());
      peerRef.current?.close();
    };
  }, []);

  return {
    userVideo,
    companionVideo,
    userStream,
    isFinished,
    onUserLeft,
  };
};
