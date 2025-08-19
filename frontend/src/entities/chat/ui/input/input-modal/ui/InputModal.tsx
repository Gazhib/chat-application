import { forwardRef } from "react";
import { Modal, type modalRefScheme } from "@shared/modal/ui/Modal";
import ActionButtons from "./components/action-buttons/ActionButtons";
import CaptionField from "./components/caption-field/CaptionField";

type InputModalScheme = {
  picture: string | undefined;
  caption: string;
  handleCaption: (value: string) => void;
  onCloseModal: () => void;
  handleSendMessage: (previewUrl: string | undefined) => void;
};

export const InputModal = forwardRef<modalRefScheme, InputModalScheme>(
  (
    { picture, caption, handleCaption, onCloseModal, handleSendMessage },
    ref
  ) => {
    return (
      <Modal ref={ref}>
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
  }
);
