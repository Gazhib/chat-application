import { useEffect, useState } from "react";
import { usePersonalSocket } from "@util/model/socket/usePersonalSocket";
import type { userInfo } from "@entities/user/model/userZustand";
type Props = {
  companionInfo: userInfo;
  myId: string;
};

export default function ChatHeader({ myId, companionInfo }: Props) {
  const [status, setStatus] = useState({
    status: "Offline",
    lastSeen: "Long time ago",
  });

  const { onlineUsers } = usePersonalSocket({ id: myId });

  useEffect(() => {
    if (companionInfo && companionInfo.id.trim() !== "") {
      if (onlineUsers.includes(companionInfo.id))
        setStatus({ status: "Online", lastSeen: "now" });
      else
        setStatus({
          status: "Offline",
          lastSeen: "Long time ago",
        });
    }
  }, [companionInfo, onlineUsers, companionInfo.id]);

  return (
    <header className="z-1 px-[20px] h-[60px] border-b-[1px] border-[#333333] flex flex-row text-white w-full justify-between items-center bg-[#242526] ">
      <section className="flex flex-col">
        <span className="text-[16px]">{companionInfo?.login}</span>
        <span
          style={{ color: status.status === "Online" ? "#21FF5F" : "#767876" }}
          className="text-[12px]"
        >
          {status.status === "Online" ? status.status : status.lastSeen}
        </span>
      </section>
      <section className="flex flex-row gap-[15px]">
        <button className="cursor-pointer">
          <i className="bi bi-telephone-fill"></i>
        </button>
        <button className="cursor-pointer">
          <i className="bi bi-three-dots-vertical"></i>
        </button>
      </section>
    </header>
  );
}
