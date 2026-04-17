import ActionButtons from "./ActionButtons";
import CaptionField from "./CaptionField";
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
    <Modal styles={{container: {background: "transparent", padding: 0}}} open={isModalOpen} onCancel={onCloseModal} footer={null} centered>
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
