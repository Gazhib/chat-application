import { useEffect, useRef, useState } from "react";
import { InputModal, type modalRefScheme } from "./inputModal/ui/InputModal";

type Props = {
  typed: string;
  handleTyped: (value: string) => void;
  handleSendMessage: () => void;
};

export default function ChatInput({
  typed,
  handleTyped,
  handleSendMessage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modalRef = useRef<modalRefScheme>(null);

  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const preview = URL.createObjectURL(e.target.files[0]);
      openModal(preview);
      e.target.value = "";
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const url = URL.createObjectURL(file);
            openModal(url);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const openModal = (preview: string) => {
    setPreviewUrl(preview);
    modalRef.current?.openModal();
  };

  const onCloseModal = () => {
    modalRef.current?.closeModal();
    setPreviewUrl(undefined);
  };

  return (
    <footer className={`bottom-0 w-full bg-[#242526] h-[50px] flex flex-col`}>
      <div className="flex flex-row w-full h-full">
        <input onChange={handleFile} type="file" hidden ref={fileInputRef} />
        <button
          className="h-full cursor-pointer aspect-square"
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="bi bi-paperclip text-white inline-block transform rotate-45 text-[4vh]"></i>
        </button>
        <input
          value={typed}
          onChange={(e) => {
            handleTyped(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder="Message..."
          className="h-full w-full focus:outline-none placeholder-[#72767D] text-white text-[14px] px-[10px]"
        />
        <button
          onClick={() => handleSendMessage()}
          className="absolute right-[15px] h-full text-center cursor-pointer relative"
        >
          <i className="bi bi-send-fill text-white text-[18px]"></i>
        </button>
      </div>
      <InputModal
        onCloseModal={onCloseModal}
        ref={modalRef}
        caption={typed}
        picture={previewUrl}
        handleCaption={handleTyped}
      />
    </footer>
  );
}
