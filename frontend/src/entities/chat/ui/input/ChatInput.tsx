import { useChatInput } from "./input-modal/model/useChatInput";
import { InputModal } from "./input-modal/ui/InputModal";
import Toolbar from "./toolbar/Toolbar";

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
    previewUrl,
    isChatModalOpen,
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
        isModalOpen={isChatModalOpen}
        onCloseModal={onCloseModal}
        caption={typed}
        picture={previewUrl}
        handleCaption={handleTyped}
        handleSendMessage={sendMessage}
      />
    </footer>
  );
}
