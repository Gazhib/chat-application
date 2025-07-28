import { useUserStore } from "../../../../../user/model/userZustand";
import type { MessageSchema } from "../model/types";
import { useContextMenu } from "./context-menu/model/useContextMenu";
import ContextMenu from "./context-menu/ui/ContextMenu";
import pp from "/pp.png";
type Props = {
  message: MessageSchema;
  place: string;
  messageId: string;
  companion: {
    login: string;
    profilePicture: string;
  };
};
export default function MessageBubble({
  message,
  place,
  messageId,
  companion,
}: Props) {
  const { isContextMenu, handleClick } = useContextMenu({ messageId });
  const time = new Date(message.createdAt).toLocaleTimeString().slice(0, 5);
  const user = useUserStore((state) => state.user);
  const isMe = place === "right";

  return (
    <div
      className={`max-w-[40%] flex ${
        isMe ? "flex-row-reverse self-end" : "flex-row self-start"
      } gap-[10px] relative`}
    >
      <img
        className="rounded-full h-[40px] w-[40px] object-cover self-end"
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
        className={`px-[15px] py-[10px] rounded-t-[16px] text-[#E4E6EB] relative max-w-[100%] flex ${
          isMe
            ? "bg-[#3A3B3C] rounded-bl-[16px]"
            : "bg-[#2F3136] rounded-br-[16px] flex-col"
        }`}
      >
        {!isMe && (
          <div className="text-blue-600 text-[12px]">{companion.login}</div>
        )}
        <div className={`flex flex-row gap-[10px] max-w-[100%] relative `}>
          <span className="break-all">{message.meta}</span>

          <span className="text-[10px] text-gray-500 self-end bottom-[-10px]">
            {time}
          </span>
        </div>
      </section>
      {isContextMenu && (
        <ContextMenu handleClickAway={handleClick} message={message} />
      )}
    </div>
  );
}
