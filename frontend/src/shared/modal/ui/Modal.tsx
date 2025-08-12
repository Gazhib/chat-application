import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PhotoModalScheme {
  children: React.ReactNode;
  onClose?: () => void;
}

export type modalRefScheme = {
  openModal: () => void;
  closeModal: () => void;
};

export const Modal = forwardRef<modalRefScheme, PhotoModalScheme>(
  ({ onClose = () => {}, children }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      openModal: () => {
        dialogRef.current?.showModal(), setIsOpen(true);
      },
      closeModal: () => {
        dialogRef.current?.close(), setIsOpen(false);
      },
    }));
    return createPortal(
      <dialog
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&:not([open])]:hidden relative backdrop-blur-xl rounded-[10px] outline-none no-scrollbar bg-transparent"
        ref={dialogRef}
        onClose={onClose}
      >
        <main
          className={`h-full flex flex-col gap-[30px] transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {children}
        </main>
      </dialog>,
      document.getElementById("modal")!
    );
  }
);
