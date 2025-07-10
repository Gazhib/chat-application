import { useEffect, useState } from "react";
import { usePersonalSocket } from "../features/hooks";

type Props = {
  companionInfo: {
    _id: string;
    login: string;
  };
  myId: string;
};

export default function ChatHeader({ myId, companionInfo }: Props) {
  const [status, setStatus] = useState({
    status: "Offline",
    lastSeen: "Long time ago",
  });

  const { onlineUsers } = usePersonalSocket(myId);

  useEffect(() => {
    if (companionInfo) {
      if (onlineUsers.includes(companionInfo._id))
        setStatus({ status: "Online", lastSeen: "now" });
      else
        setStatus({
          status: "Offline",
          lastSeen: "Long time ago",
        });
    }
  }, [companionInfo, onlineUsers, companionInfo && companionInfo._id]);

  return (
    <header className="z-1 px-[20px] h-[60px] border-b-[1px] border-[#333333] flex flex-row text-white w-full justify-between items-center bg-[#242526] ">
      <section className="flex flex-col">
        <span className="text-[16px]">{companionInfo && companionInfo.login}</span>
        <span
          style={{ color: status.status === "Online" ? "#21FF5F" : "#767876" }}
          className="text-[12px]"
        >
          {status.status === "Online" ? status.status : status.lastSeen}
        </span>
      </section>
      <section className="flex flex-row gap-[15px]">
        <button>
          <i className="bi bi-telephone-fill"></i>
        </button>
        <button>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
      </section>
    </header>
  );
}
