import ToolbarButton from "@/shared/toolbar-button/ui/ToolbarButton";
import { useVideoToolbar } from "../../model/useVideoToolbar";

export default function ScreenButton() {
  const { shareScreen, isSharing, stopShareScreen } = useVideoToolbar();

  const onClick = () => {
    if (isSharing) stopShareScreen();
    else shareScreen();
  };

  return (
    <ToolbarButton onClick={onClick}>
      <i
        className={`bi bi-cast transition duration-400 ${
          isSharing && "text-red-500"
        }`}
      />
    </ToolbarButton>
  );
}
