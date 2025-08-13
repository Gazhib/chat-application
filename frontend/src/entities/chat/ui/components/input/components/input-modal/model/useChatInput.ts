import type { modalRefScheme } from "@/shared/modal/ui/Modal";
import { useEffect, useRef, useState } from "react";

interface useChatInputScheme {
  handleSendMessage: (previewUrl: string | undefined) => void;
}

export const useChatInput = ({ handleSendMessage }: useChatInputScheme) => {
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

  const sendMessage = () => {
    console.log(previewUrl);
    handleSendMessage(previewUrl);
    onCloseModal();
  };

  return {
    sendMessage,
    onCloseModal,
    fileInputRef,
    handleFile,
    previewUrl,
    modalRef,
  };
};
