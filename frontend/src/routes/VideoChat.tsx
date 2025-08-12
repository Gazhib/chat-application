import VideoContainer from "@/entities/video-chat/ui/VideoContainer";
import VideoToolbar from "@/entities/video-chat/ui/Toolbar/ui/VideoToolbar";
import { socket } from "@/util/model/socket/socket";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";

type payload = {
  target: string | undefined;
  caller: string | undefined;
  sdp: RTCSessionDescription | undefined | null;
};

export default function VideoChat() {
  const userVideo = useRef<HTMLVideoElement>(null);
  const userStream = useRef<MediaStream>(null);
  const companionVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection>(null);
  const otherUser = useRef<string>(null);

  const { callId } = useParams();

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
    console.log("onHandleReceiveCall");
    peerRef.current = createPeer();
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
        peerRef.current?.addTrack(track, userStream.current!)
      );
  };

  const onOtherUser = (userId: string) => {
    console.log("otherUser");
    callUser(userId);
    otherUser.current = userId;
  };

  const onUserJoined = (userId: string) => {
    console.log("userJoined");
    otherUser.current = userId;
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (userVideo.current) userVideo.current.srcObject = stream;
        userStream.current = stream;
        socket.emit("call", callId);

        socket.on("otherUser", onOtherUser);

        socket.on("userJoined", onUserJoined);

        socket.on("offer", handleReceiveCall);

        socket.on("answer", handleAnswer);

        socket.on("ice-candidate", handleNewICECandidateMsg);

        return () => {
          socket.off("otherUser", onOtherUser);
          socket.off("userJoined", onUserJoined);
          socket.off("offer", handleReceiveCall);
          socket.off("answer", handleAnswer);
          socket.off("ice-candidate", handleNewICECandidateMsg);
          peerRef.current?.close();
        };
      });
  }, []);

  return (
    <main className="ml-[50px] bg-[#18191A] h-full flex flex-col justify-around">
      <VideoContainer userVideo={userVideo} companionVideo={companionVideo} />
      <VideoToolbar />
    </main>
  );
}
