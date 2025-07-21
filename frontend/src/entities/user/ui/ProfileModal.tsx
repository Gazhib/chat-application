import { forwardRef, useImperativeHandle, useRef } from "react";
import pp from "/pp.png";
import { useUserStore } from "../../../util/model/store/zustand";

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
      <main className="bg-[#18191A] px-[20px] py-[20px] w-[350px] h-[1000px] text-white">
        <section className="flex flex-row gap-[20px] border-b-[1px] border-[#333333] pb-[20px]">
          <img
            src={pp}
            className="w-[50px] h-[50px] rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span>{user?.login}</span>
            <span>{user?.email}</span>
          </div>
        </section>
        <section>
          
        </section>
      </main>
    </dialog>
  );
});
