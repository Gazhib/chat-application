import { Outlet } from "react-router";
import { useEffect } from "react";
import { useUserStore } from "@/entities/user/model/userZustand";
import { useKeyStore } from "@/util/model/zustand";
import ChatSidebar from "@/entities/user-list/ui/ChatSidebar";
import { useSocketMessages } from "@/entities/messages/model/useSocketMessages";
import { usePersonalSocket } from "@/util/model/usePersonalSocket";
import { VideoIncomingModal } from "@/entities/video-chat/ui/VideoIncomingModal";
import { VideoCallingModal } from "@/entities/video-chat/ui/VideoCallingModal";
import { socket } from "@/util/model/socket";

export default function ChatsPage() {
  const user = useUserStore((state) => state.user);
  const callee = useUserStore((state) => state.callee);
  const roomId = useUserStore((state) => state.roomId);
  const setCallee = useUserStore((state) => state.setCallee);
  const setRoomId = useUserStore((state) => state.setRoomId);
  usePersonalSocket({ id: user?._id ?? "" });

  const generateKeyPairs = useKeyStore((state) => state?.getKeyPairs);

  const { callingUser, callingRoomId, dismissCall } = useSocketMessages();

  useEffect(() => {
    async function genKeyPairs() {
      generateKeyPairs();
    }
    genKeyPairs();
  }, [user?._id]);

  useEffect(() => {
    const onAccepted = ({ roomId: acceptedRoomId }: { roomId: string }) => {
      setCallee(null);
      setRoomId(undefined);


      window.open(
        `${window.location.origin}/call/${acceptedRoomId}`,
        "_blank",
        "noopener,noreferrer"
      );
    };

    const onCancelled = () => {
      dismissCall();
    };

    socket.on("callAccepted", onAccepted);
    socket.on("callCancelled", onCancelled);

    return () => {
      socket.off("callAccepted", onAccepted);
      socket.off("callCancelled", onCancelled);
    };
  }, [dismissCall, setCallee, setRoomId]);

  const handleAccept = () => {
    if (!callingRoomId || !callingUser) return;
    socket.emit("callAccepted", {
      callerId: callingUser._id,
      roomId: callingRoomId,
    });
    window.open(
      `${window.location.origin}/call/${callingRoomId}`,
      "_blank",
      "noopener,noreferrer"
    );
    dismissCall();
  };

  const handleCancelOutgoing = () => {
    if (callee) socket.emit("cancelCall", { calleeId: callee._id });
    setCallee(null);
    setRoomId(undefined);
  };

  return (
    <>
      <main className="flex h-screen min-w-0 flex-row bg-[#18191A]">
        <ChatSidebar />
        <Outlet />
        <VideoIncomingModal
          caller={callingUser}
          isModalOpen={callingUser !== null}
          handleAccept={handleAccept}
          handleDecline={dismissCall}
          handleCancel={dismissCall}
        />
        <VideoCallingModal
          callee={callee}
          isModalOpen={callee !== null && !!roomId}
          handleCancel={handleCancelOutgoing}
        />
      </main>
    </>
  );
}
