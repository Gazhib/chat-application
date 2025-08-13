import { useVideoToolbar } from "@/entities/video-chat/ui/Toolbar/model/useVideoToolbar";
import ToolbarButton from "@/shared/toolbar-button/ui/ToolbarButton";

export default function VideoButton({}: {}) {
  const { toggleVideo, isVideo } = useVideoToolbar();

  return (
    <ToolbarButton onClick={toggleVideo}>
      <i
        className={`transition duration-400 ${
          isVideo ? "bi bi-camera-video" : "bi bi-camera-video-off text-red-500"
        }`}
      />
    </ToolbarButton>
  );
}
