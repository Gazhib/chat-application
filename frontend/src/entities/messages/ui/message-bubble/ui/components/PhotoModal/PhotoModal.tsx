import { Modal } from "antd";

interface PhotoModalScheme {
  picture: string | undefined;
  isModalOpen: boolean;
  handleCancel: () => void;
}

export const PhotoModal = ({
  picture,
  isModalOpen,
  handleCancel,
}: PhotoModalScheme) => {
  return (
    <Modal styles={{container: {background: "transparent", padding: 0}}} open={isModalOpen} onCancel={handleCancel} footer={null} centered>
      <img src={picture} className="max-h-[90vh]" />
    </Modal>
  );
};
