import { forwardRef, useImperativeHandle, useRef } from "react";
import type { modalRefScheme } from "../../../chat-input/inputModal/ui/InputModal";
import { createPortal } from "react-dom";

interface PhotoModalScheme {
  picture: string | undefined;
}

export const PhotoModal = forwardRef<modalRefScheme, PhotoModalScheme>(
  ({ picture }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      openModal: () => dialogRef.current?.showModal(),
      closeModal: () => dialogRef.current?.close(),
    }));

    return createPortal(
      <dialog
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&:not([open])]:hidden relative backdrop-blur-xl rounded-[10px] outline-none no-scrollbar bg-transparent"
        ref={dialogRef}
      >
        <main>
          <img src={picture} className="max-h-[90vh]" />
          {/* <button
            className="absolute text-white top-0 right-0"
            onClick={() => dialogRef.current?.close()}
          >
            <i className="bi bi-x-lg cursor-pointer"></i>
          </button> */}
        </main>
      </dialog>,
      document.getElementById("modal")!
    );
  }
);
