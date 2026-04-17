import ActionButtons from "./components/action-buttons/ActionButtons";
import CaptionField from "./components/caption-field/CaptionField";
import { Modal } from "antd";

type InputModalScheme = {
  picture: string | undefined;
  caption: string;
  handleCaption: (value: string) => void;
  onCloseModal: () => void;
  handleSendMessage: (previewUrl: string | undefined) => void;
  isModalOpen: boolean;
};

export const InputModal = ({
  picture,
  caption,
  handleCaption,
  onCloseModal,
  handleSendMessage,
  isModalOpen,
}: InputModalScheme) => {
  return (
    <Modal open={isModalOpen} onCancel={onCloseModal} footer={null} centered>
      <main className="bg-[#242526] px-[20px] py-[20px]">
        <img src={picture} className="max-h-[300px]" />
        <CaptionField
          picture={picture}
          caption={caption}
          handleCaption={handleCaption}
          handleSendMessage={handleSendMessage}
        />
        <ActionButtons
          onCloseModal={onCloseModal}
          handleSendMessage={handleSendMessage}
          picture={picture}
        />
      </main>
    </Modal>
  );
};
