import { forwardRef } from "react";
import Description from "./profile-components/Description";
import UserInfo from "./profile-components/UserInfo";
import { Modal, type modalRefScheme } from "@/shared/modal/ui/Modal";
import { useUserStore, type userInfo } from "../model/userZustand";

type ProfileModalScheme = {
  user?: userInfo;
};

export const ProfileModal = forwardRef<modalRefScheme, ProfileModalScheme>(
  ({ user }, ref) => {
    const meUser = useUserStore((state) => state.user);

    const isMe = user?.id === meUser?.id;
    
    return (
      <Modal ref={ref}>
        <main className="bg-[#18191A] px-[20px] py-[20px] w-[350px] h-[1000px] text-white">
          <UserInfo isMe={isMe} user={user} />
          <Description isMe={isMe} userDescription={user?.description ?? ""} />
        </main>
      </Modal>
    );
  }
);
