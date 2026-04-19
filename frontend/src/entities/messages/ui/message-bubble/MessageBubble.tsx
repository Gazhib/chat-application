import { useEffect, useRef, useState } from "react";
import type { MessageSchema } from "./types";
import { PhotoModal } from "./ui/PhotoModal";
import { useUserStore, type userInfo } from "@/entities/user/model/userZustand";
import Meta from "./ui/Meta";
import ProfilePicture from "./ui/ProfilePicture";
import { pp } from "@/entities/user/model/useUser";
import { useContextMenu } from "./ui/context-menu/useContextMenu";
import ContextMenu from "./ui/context-menu/ContextMenu";
import CallMessage from "./ui/CallMessage";

import { Popover } from "antd";
import { ProfileModal } from "@/entities/user/ui/ProfileModal";
type Props = {
  message: MessageSchema;
  place: string;
  messageId: string;
  companion: userInfo;
  handleCall?: () => void;
  readMessage: (messageId: string) => Promise<void>;
};
export default function MessageBubble({
  message,
  place,
  messageId,
  companion,
  handleCall = () => {},
  readMessage,
}: Props) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  const { isContextMenu, handleClickContextMenu } = useContextMenu({
    messageId,
  });

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const time = new Date(message.createdAt).toLocaleTimeString().slice(0, 5);
  const user = useUserStore((state) => state.user);
  const isMe = place === "right";

  const handleOpenModal = () => {
    setIsProfileModalOpen(true);
  };

  const handleOpenPhoto = () => {
    setIsPhotoModalOpen(true);
  };

  const isUnfinishedCall =
    message.messageType === "call" && !message.finishedAt;

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

  if (isUnfinishedCall) return null;

  return (
    <>
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
          styles={{ container: { backgroundColor: "transparent", padding: 0 } }}
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
            {message.messageType === "call" && message.roomId ? (
              <CallMessage
                handleCall={handleCall}
                time={time}
                createdAt={message.createdAt}
                finishedAt={message.finishedAt!}
                isMe={isMe}
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
      <ProfileModal
        user={isMe ? user : companion}
        isModalOpen={isProfileModalOpen}
        handleCancel={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
