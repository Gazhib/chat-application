import ToolbarButton from "@/shared/toolbar-button/ToolbarButton";
import { useVideoToolbar } from "../model/useVideoToolbar";

export default function PhoneButton() {
  const { hangUp } = useVideoToolbar();
  return (
    <ToolbarButton onClick={hangUp}>
      <i className="bi bi-telephone-fill text-red-500 inline-block transform rotate-135" />
    </ToolbarButton>
  );
}
