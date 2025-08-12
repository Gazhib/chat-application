import AttachmentButton from "./components/attachment-button/AttachmentButton";
import AttachmentInput from "./components/attachment-button/AttachmentInput";
import SendButton from "./components/send-button/SendButton";
import TextMessageInput from "./components/text-message-input/TextMessageInput";
interface ToolbarScheme {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  typed: string;
  handleTyped: (value: string) => void;
  sendMessage: () => void;
}
export default function Toolbar({
  fileInputRef,
  handleFile,
  typed,
  handleTyped,
  sendMessage,
}: ToolbarScheme) {
  return (
    <div className="flex flex-row w-full h-full">
      <AttachmentInput ref={fileInputRef} onChange={handleFile} />
      <AttachmentButton ref={fileInputRef} />
      <TextMessageInput
        typed={typed}
        handleTyped={handleTyped}
        sendMessage={sendMessage}
      />
      {typed && <SendButton sendMessage={sendMessage} />}
    </div>
  );
}
