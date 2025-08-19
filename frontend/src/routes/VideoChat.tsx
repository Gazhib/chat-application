import VideoContainer from "@/entities/video-chat/ui/VideoContainer";
import VideoToolbar from "@/entities/video-chat/ui/Toolbar/ui/VideoToolbar";
import { useVideoChat } from "@/entities/video-chat/model/useVideoChat";
import type { LoaderFunctionArgs } from "react-router";
import { port } from "@/util/ui/ProtectedRoutes";

export default function VideoChat() {
  const { userVideo, companionVideo, isFinished } = useVideoChat();

  return (
    <main className="ml-[50px] bg-[#18191A] min-h-full max-w-screen flex flex-col justify-around">
      {isFinished ? (
        <div className="text-white flex justify-center">Call finished</div>
      ) : (
        <>
          <VideoContainer
            userVideo={userVideo}
            companionVideo={companionVideo}
          />
          <VideoToolbar />
        </>
      )}
    </main>
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { callId } = params;
  const response = await fetch(`${port}/calls/${callId}`, {
    credentials: "include",
  });
  
  if (!response.ok) throw new Error("Not your call, or unrecognised call id");
}
