import { forwardRef, useImperativeHandle, useRef } from "react";
import Description from "./profile-components/Description";
import { useUserStore } from "../model/userZustand";
import UserInfo from "./profile-components/UserInfo";

export type modalRefScheme = {
  openModal: () => void;
  closeModal: () => void;
};

export const ProfileModal = forwardRef<modalRefScheme>(({}, ref) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    openModal: () => dialogRef.current?.showModal(),
    closeModal: () => dialogRef.current?.close(),
  }));

  const user = useUserStore((state) => state.user);

  return (
    <dialog
      className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&:not([open])]:hidden fixed inset-0 backdrop-blur-xl rounded-[10px] outline-none no-scrollbar"
      ref={dialogRef}
    >
      <button
        onClick={() => {
          dialogRef.current?.close();
        }}
        className="absolute right-[1rem] top-[0.5rem] cursor-pointer"
      >
        <i className="bi bi-x-lg text-white"></i>
      </button>
      <main className="bg-[#18191A] px-[20px] py-[20px] w-[350px] h-[1000px] text-white">
        <UserInfo user={user} />
        <Description />
      </main>
    </dialog>
  );
});
