import Description from "./Description";
import UserInfo from "./UserInfo";
import { useUserStore, type userInfo } from "../model/userZustand";
import { Modal } from "antd";

type ProfileModalScheme = {
  user?: userInfo;
  isModalOpen: boolean;
  handleCancel: () => void;
};

export const ProfileModal = ({
  user,
  isModalOpen,
  handleCancel,
}: ProfileModalScheme) => {
  const meUser = useUserStore((state) => state.user);

  const isMe = user?._id === meUser?._id;

  return (
    <Modal
      styles={{ container: { backgroundColor: "transparent", padding: 0 } }}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      centered
      width={350}
    >
      <main className="bg-[#18191A] px-[20px] py-[20px] w-[350px] h-[1000px] text-white">
        <UserInfo isMe={isMe} user={user} />
        <Description isMe={isMe} userDescription={user?.description ?? ""} />
      </main>
    </Modal>
  );
};
