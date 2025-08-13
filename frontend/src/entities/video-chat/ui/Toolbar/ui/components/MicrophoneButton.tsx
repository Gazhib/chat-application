import { useVideoToolbar } from "@/entities/video-chat/ui/Toolbar/model/useVideoToolbar";
import ToolbarButton from "@/shared/toolbar-button/ui/ToolbarButton";

export default function MicrophoneButton({}: {}) {
  const { toggleAudio, isAudio } = useVideoToolbar();

  return (
    <ToolbarButton onClick={toggleAudio}>
      <i className={`transition duration-400 ${isAudio ? "bi bi-mic" : "bi bi-mic-mute text-red-500"}`} />
    </ToolbarButton>
  );
}
