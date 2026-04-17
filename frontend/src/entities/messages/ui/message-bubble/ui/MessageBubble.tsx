import { useEffect, useRef, useState } from "react";
import type { MessageSchema } from "../model/types";
import { PhotoModal } from "./components/PhotoModal/PhotoModal";
import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import Meta from "./components/Meta";
import ProfilePicture from "./components/ProfilePicture";
import { pp } from "@/entities/user/model/useUser";
import { useContextMenu } from "./components/context-menu/model/useContextMenu";
import ContextMenu from "./components/context-menu/ui/ContextMenu";
import CallMessage from "./components/CallMessage";

import { Popover } from "antd";
type Props = {
  message: MessageSchema;
  place: string;
  messageId: string;
  companion: userInfo;
  setCurrentUserModal?: (value: string) => void;
  handleCall?: () => void;
  readMessage: (messageId: string) => Promise<void>;
};
export default function MessageBubble({
  message,
  place,
  messageId,
  companion,
  setCurrentUserModal = () => {},
  handleCall = () => {},
  readMessage,
}: Props) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  const { isContextMenu, handleClickContextMenu } = useContextMenu({
    messageId,
  });

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const time = new Date(message.createdAt).toLocaleTimeString().slice(0, 5);
  const user = useUserStore((state) => state.user);
  const isMe = place === "right";

  const handleOpenModal = () => {
    setCurrentUserModal(isMe ? "me" : "companion");
    // modalRef.current?.openModal();
  };

  const handleOpenPhoto = () => {
    setIsPhotoModalOpen(true);
  };

  useEffect(() => {
    if (!bubbleRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isMe && message?.status?.read !== 1) {
            readMessage(message._id!);
            observer.unobserve(bubbleRef.current!);
          }
        });
      },
      { threshold: 1.0 }
    );

    observer.observe(bubbleRef.current);

    return () => {
      if (bubbleRef.current) {
        observer.unobserve(bubbleRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`max-w-[65%] flex ${
        isMe ? "flex-row-reverse self-end" : "flex-row self-start"
      } gap-[10px] relative`}
    >
      <ProfilePicture
        handleOpenModal={handleOpenModal}
        picture={
          isMe ? user?.profilePicture || pp : companion?.profilePicture || pp
        }
      />
      <Popover
        content={<ContextMenu message={message} />}
        placement="leftTop"
        onOpenChange={() => {
          if (isMe) handleClickContextMenu();
        }}
        open={isContextMenu}
        trigger={"click"}
        overlayInnerStyle={{ backgroundColor: "transparent", padding: 0 }}
      >
        <section
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
            <CallMessage
              handleCall={handleCall}
              time={time}
              callId={message.meta}
              finishedAt={message.finishedAt}
            />
          ) : (
            <Meta
              time={time}
              picture={message.picture}
              meta={message.meta}
              encryptionStatus={message.encryptionStatus}
              handleOpenPhoto={handleOpenPhoto}
            />
          )}
        </section>
      </Popover>
      <PhotoModal
        picture={message.picture}
        isModalOpen={isPhotoModalOpen}
        handleCancel={() => setIsPhotoModalOpen(false)}
      />
    </div>
  );
}
