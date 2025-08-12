import { Modal, type modalRefScheme } from "@/shared/modal/ui/Modal";
import { forwardRef } from "react";


interface PhotoModalScheme {
  picture: string | undefined;
}

export const PhotoModal = forwardRef<modalRefScheme, PhotoModalScheme>(
  ({ picture }, ref) => {
    return (
      <Modal ref={ref}>
        <img src={picture} className="max-h-[90vh]" />
      </Modal>
    );
  }
);
