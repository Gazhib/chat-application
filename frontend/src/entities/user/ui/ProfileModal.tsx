import { forwardRef, useImperativeHandle, useRef } from "react";
import Description from "./profile-components/Description";
import { useUserStore, type userInfo } from "../model/userZustand";
import UserInfo from "./profile-components/UserInfo";

export type modalRefScheme = {
  openModal: () => void;
  closeModal: () => void;
};

type ProfileModalScheme = {
  user?: userInfo;
};

export const ProfileModal = forwardRef<modalRefScheme, ProfileModalScheme>(
  ({ user }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      openModal: () => dialogRef.current?.showModal(),
      closeModal: () => dialogRef.current?.close(),
    }));

    const meUser = useUserStore((state) => state.user);

    const isMe = user?.id === meUser?.id;

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
          <UserInfo isMe={isMe} user={user} />
          <Description isMe={isMe} userDescription={user?.description ?? ""} />
        </main>
      </dialog>
    );
  }
);
