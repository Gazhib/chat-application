import CustomButton from "../CustomButton";
interface ActionButtonsScheme {
  onCloseModal: () => void;
  handleSendMessage: (picture: string | undefined) => void;
  picture: string | undefined;
}
export default function ActionButtons({
  onCloseModal,
  handleSendMessage,
  picture,
}: ActionButtonsScheme) {
  return (
    <footer className="flex flex-row justify-between text-white">
      <CustomButton onClick={onCloseModal}>Close</CustomButton>
      <CustomButton onClick={() => handleSendMessage(picture)}>
        Send
      </CustomButton>
    </footer>
  );
}
