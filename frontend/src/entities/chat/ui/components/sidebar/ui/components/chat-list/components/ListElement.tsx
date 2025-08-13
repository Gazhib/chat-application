import type { MessageSchema } from "@/entities/chat/ui/components/messages/ui/components/message-bubble/model/types";
import { pp } from "@/entities/user/model/useUser";

interface CLElementScheme {
  openChat: () => void;
  login: string;
  profilePicture?: string;
  lastMessage?: MessageSchema;
  isOnline?: boolean;
}

export default function CLElement({
  openChat,
  login,
  profilePicture,
  lastMessage,
  isOnline = false,
}: CLElementScheme) {
  return (
    <button
      onClick={openChat}
      className="h-[60px] px-[10px] relative w-full items-center gap-[10px] flex flex-row border-b-[1px] border-[#333333] hover:bg-[#2E2F30] text-white cursor-pointer"
    >
      <img
        src={profilePicture ? profilePicture : pp}
        className="w-[50px] h-[50px] object-cover rounded-full"
      />
      <section className="flex flex-col truncate">
        <span className="text-[16px] self-start">{login}</span>
        <div className="text-[12px] text-[#9A9C99] self-start flex flex-row gap-[5px]">
          {lastMessage?.picture && (
            <img
              src={lastMessage.picture}
              className="w-[15px] h-[15px] object-cover"
            />
          )}
          <span>
            {lastMessage?.messageType === "call" ? "Call" : lastMessage?.meta}
          </span>
        </div>
      </section>
      {isOnline && (
        <div className="absolute w-[10px] h-[10px] bg-green-600 rounded-full left-[45px] bottom-[5px]" />
      )}
    </button>
  );
}
