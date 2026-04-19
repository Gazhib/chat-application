import { Modal } from "antd";
import { pp } from "@/entities/user/model/useUser";
import type { userInfo } from "@/entities/user/model/userZustand";

type VideoCallingModalProps = {
  callee: userInfo | null;
  isModalOpen: boolean;
  handleCancel: () => void;
};

export const VideoCallingModal = ({
  callee,
  isModalOpen,
  handleCancel,
}: VideoCallingModalProps) => {
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
          Calling
        </span>

        <div className="relative mt-[4px]">
          <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></span>
          <span className="absolute inset-[-6px] rounded-full border border-blue-500/30"></span>
          <img
            src={callee?.profilePicture || pp}
            alt={callee?.login ?? "Callee"}
            className="relative w-[120px] h-[120px] rounded-full object-cover border-2 border-[#2F3136]"
          />
        </div>

        <div className="flex flex-col items-center gap-[2px]">
          <span className="text-[20px] font-semibold">
            {callee?.login ?? "Unknown"}
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-[6px]">
            <i className="bi bi-camera-video-fill text-blue-400"></i>
            Ringing...
          </span>
        </div>

        <div className="flex flex-row mt-[8px]">
          <button
            onClick={handleCancel}
            aria-label="Cancel"
            className="group flex flex-col items-center gap-[6px] cursor-pointer"
          >
            <span className="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-red-600 group-hover:bg-red-500 transition-colors shadow-[0_0_16px_rgba(239,68,68,0.35)]">
              <i className="bi bi-telephone-fill text-white text-[20px] rotate-[135deg]"></i>
            </span>
            <span className="text-xs text-gray-400">Cancel</span>
          </button>
        </div>
      </main>
    </Modal>
  );
};
