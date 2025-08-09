import { forwardRef, useImperativeHandle, useRef } from "react";
import CustomButton from "./components/CustomButton";

export type modalRefScheme = {
  openModal: () => void;
  closeModal: () => void;
};

type InputModalScheme = {
  picture: string | undefined;
  caption: string;
  handleCaption: (value: string) => void;
  onCloseModal: () => void;
  handleSendMessage: (previewUrl: string | undefined) => void;
};

export const InputModal = forwardRef<modalRefScheme, InputModalScheme>(
  (
    { picture, caption, handleCaption, onCloseModal, handleSendMessage },
    ref
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      openModal: () => dialogRef.current?.showModal(),
      closeModal: () => dialogRef.current?.close(),
    }));

    return (
      <dialog
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&:not([open])]:hidden fixed backdrop-blur-xl rounded-[10px] outline-none no-scrollbar bg-transparent"
        ref={dialogRef}
        onClose={onCloseModal}
      >
        <main
          className={`bg-[#242526] px-[20px] py-[20px] h-full flex flex-col gap-[30px] transition-opacity duration-500 ${
            dialogRef.current?.open ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={picture} className="max-h-[300px]" />
          <section className="">
            <span className="text-white text-[14px]">Caption</span>
            <input
              className="w-full text-white border-b-[1.5px] border-[#666666] outline-none "
              value={caption}
              onChange={(e) => handleCaption(e.target.value)}
            />
          </section>
          <footer className="flex flex-row justify-between text-white">
            <CustomButton onClick={onCloseModal}>Close</CustomButton>
            <CustomButton onClick={() => handleSendMessage(picture)}>
              Send
            </CustomButton>
          </footer>
        </main>
      </dialog>
    );
  }
);
