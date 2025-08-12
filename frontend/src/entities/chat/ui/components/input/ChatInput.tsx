import { useChatInput } from "./components/input-modal/model/useChatInput";
import { InputModal } from "./components/input-modal/ui/InputModal";
import Toolbar from "./components/toolbar/ui/Toolbar";

type Props = {
  typed: string;
  handleTyped: (value: string) => void;
  handleSendMessage: (previewUrl: string | undefined) => void;
};

export default function ChatInput({
  typed,
  handleTyped,
  handleSendMessage,
}: Props) {
  const {
    handleFile,
    fileInputRef,
    sendMessage,
    onCloseModal,
    modalRef,
    previewUrl,
  } = useChatInput({
    handleSendMessage,
  });

  return (
    <footer className={`bottom-0 w-full bg-[#242526] h-[50px] flex flex-col`}>
      <Toolbar
        handleFile={handleFile}
        typed={typed}
        handleTyped={handleTyped}
        sendMessage={sendMessage}
        fileInputRef={fileInputRef}
      />
      <InputModal
        onCloseModal={onCloseModal}
        ref={modalRef}
        caption={typed}
        picture={previewUrl}
        handleCaption={handleTyped}
        handleSendMessage={sendMessage}
      />
    </footer>
  );
}
