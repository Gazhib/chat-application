import { useRef } from "react";
import type { MessageSchema } from "../model/types";
import { useContextMenu } from "./context-menu/model/useContextMenu";
import ContextMenu from "./context-menu/ui/ContextMenu";
import pp from "/pp.png";
import { PhotoModal } from "./PhotoModal/PhotoModal";
import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import { useSidebar } from "@/widget/extended-sidebar/model/useSidebar";
import type { modalRefScheme } from "@/shared/modal/ui/Modal";
type Props = {
  message: MessageSchema;
  place: string;
  messageId: string;
  companion: userInfo;
  setCurrentUserModal?: (value: string) => void;
};
export default function MessageBubble({
  message,
  place,
  messageId,
  companion,
  setCurrentUserModal = () => {},
}: Props) {
  const { isContextMenu, handleClick } = useContextMenu({ messageId });
  const time = new Date(message.createdAt).toLocaleTimeString().slice(0, 5);
  const user = useUserStore((state) => state.user);
  const isMe = place === "right";

  const { modalRef } = useSidebar();

  const handleOpenModal = () => {
    setCurrentUserModal(isMe ? "me" : "companion");
    modalRef.current?.openModal();
  };

  const photoModalRef = useRef<modalRefScheme>(null);

  const handleOpenPhoto = () => {
    photoModalRef.current?.openModal();
  };

  return (
    <div
      className={`max-w-[65%] flex ${
        isMe ? "flex-row-reverse self-end" : "flex-row self-start"
      } gap-[10px] relative`}
    >
      <img
        className="rounded-full h-[40px] w-[40px] object-cover self-end cursor-pointer"
        onClick={handleOpenModal}
        src={
          isMe
            ? user?.profilePicture === "Empty"
              ? pp
              : user?.profilePicture
            : companion.profilePicture ?? pp
        }
      />
      <section
        onContextMenu={(e) => {
          e.preventDefault();
          if (isMe) handleClick();
        }}
        className={`px-[15px] py-[10px] rounded-t-[16px] text-[#E4E6EB] relative w-fit overflow-hidden items-end flex ${
          isMe
            ? "bg-[#3A3B3C] rounded-bl-[16px]"
            : "bg-[#2F3136] rounded-br-[16px] flex-col"
        }`}
      >
        {!isMe && (
          <div
            onClick={handleOpenModal}
            className="text-blue-600 text-[12px] cursor-pointer"
          >
            {companion.login}
          </div>
        )}
        <div className={`flex flex-row gap-[10px] items-end relative `}>
          <section className="flex flex-col">
            <img
              onClick={handleOpenPhoto}
              src={message.picture}
              className="block w-full max-w-[420px]  h-auto object-cover cursor-pointer"
            />
            <span className="break-all">{message.meta}</span>
          </section>

          <span className="text-[10px] text-gray-500 self-end bottom-[-10px]">
            {time}
          </span>
        </div>
      </section>
      {isContextMenu && (
        <ContextMenu handleClickAway={handleClick} message={message} />
      )}
      <PhotoModal picture={message.picture} ref={photoModalRef} />
    </div>
  );
}
