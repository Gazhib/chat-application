import Description from "./profile-components/Description";
import UserInfo from "./profile-components/UserInfo";
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
    <Modal open={isModalOpen} onCancel={handleCancel} footer={null} centered>
      <main className="bg-[#18191A] px-[20px] py-[20px] w-[350px] h-[1000px] text-white">
        <UserInfo isMe={isMe} user={user} />
        <Description isMe={isMe} userDescription={user?.description ?? ""} />
      </main>
    </Modal>
  );
};
