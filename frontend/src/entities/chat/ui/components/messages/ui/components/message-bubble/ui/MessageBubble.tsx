import { useRef } from "react";
import type { MessageSchema } from "../model/types";
import { PhotoModal } from "./components/PhotoModal/PhotoModal";
import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import { useSidebar } from "@/widget/extended-sidebar/model/useSidebar";
import type { modalRefScheme } from "@/shared/modal/ui/Modal";
import Meta from "./components/Meta";
import ProfilePicture from "./components/ProfilePicture";
import { pp } from "@/entities/user/model/useUser";
import { useContextMenu } from "./components/context-menu/model/useContextMenu";
import ContextMenu from "./components/context-menu/ui/ContextMenu";
import CallMessage from "./components/CallMessage";
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
      <ProfilePicture
        handleOpenModal={handleOpenModal}
        picture={
          isMe ? user?.profilePicture || pp : companion.profilePicture || pp
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
            className="text-blue-600 text-[12px] cursor-pointer self-start"
          >
            {companion.login}
          </div>
        )}
        {message.messageType === "call" ? (
          <CallMessage time={time} callId={message.meta} />
        ) : (
          <Meta
            time={time}
            picture={message.picture}
            meta={message.meta}
            handleOpenPhoto={handleOpenPhoto}
          />
        )}
      </section>
      {isContextMenu && (
        <ContextMenu handleClickAway={handleClick} message={message} />
      )}
      <PhotoModal picture={message.picture} ref={photoModalRef} />
    </div>
  );
}
