export default function ProfilePicture({
  picture,
  handleOpenModal,
}: {
  picture: string;
  handleOpenModal: () => void;
}) {
  return (
    <img
      className="rounded-full h-[40px] w-[40px] object-cover self-end cursor-pointer"
      onClick={handleOpenModal}
      src={picture}
    />
  );
}
