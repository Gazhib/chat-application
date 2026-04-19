import { Modal } from "antd";
import { pp } from "@/entities/user/model/useUser";
import type { userInfo } from "@/entities/user/model/userZustand";

type VideoIncomingModalProps = {
  caller: userInfo | null;
  isModalOpen: boolean;
  handleAccept: () => void;
  handleDecline: () => void;
  handleCancel: () => void;
};

export const VideoIncomingModal = ({
  caller,
  isModalOpen,
  handleAccept,
  handleDecline,
  handleCancel,
}: VideoIncomingModalProps) => {
  return (
    <Modal
      styles={{ container: { backgroundColor: "transparent", padding: 0 } }}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      centered
      width={350}
      closable={false}
    >
      <main className="bg-[#18191A] px-[30px] py-[30px] w-[350px] text-white flex flex-col items-center gap-[18px] rounded-[12px]">
        <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
          Incoming call
        </span>

        <div className="relative mt-[4px]">
          <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></span>
          <span className="absolute inset-[-6px] rounded-full border border-green-500/30"></span>
          <img
            src={caller?.profilePicture || pp}
            alt={caller?.login ?? "Caller"}
            className="relative w-[120px] h-[120px] rounded-full object-cover border-2 border-[#2F3136]"
          />
        </div>

        <div className="flex flex-col items-center gap-[2px]">
          <span className="text-[20px] font-semibold">
            {caller?.login ?? "Unknown"}
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-[6px]">
            <i className="bi bi-camera-video-fill text-green-400"></i>
            is calling you...
          </span>
        </div>

        <div className="flex flex-row gap-[40px] mt-[8px]">
          <button
            onClick={handleDecline}
            aria-label="Decline"
            className="group flex flex-col items-center gap-[6px] cursor-pointer"
          >
            <span className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-red-600 group-hover:bg-red-500 transition-colors shadow-[0_0_16px_rgba(239,68,68,0.35)]">
              <i className="bi bi-telephone-fill text-white text-[20px] rotate-[135deg]"></i>
            </span>
            <span className="text-xs text-gray-400">Decline</span>
          </button>

          <button
            onClick={handleAccept}
            aria-label="Accept"
            className="group flex flex-col items-center gap-[6px] cursor-pointer"
          >
            <span className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-green-600 group-hover:bg-green-500 transition-colors shadow-[0_0_16px_rgba(34,197,94,0.4)] animate-[pulse_2s_ease-in-out_infinite]">
              <i className="bi bi-telephone-fill text-white text-[20px]"></i>
            </span>
            <span className="text-xs text-gray-400">Accept</span>
          </button>
        </div>
      </main>
    </Modal>
  );
};
