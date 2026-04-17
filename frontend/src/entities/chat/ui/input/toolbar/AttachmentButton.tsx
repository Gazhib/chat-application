interface AttachmentButtonScheme {
  ref: React.RefObject<HTMLInputElement | null>;
}
export default function AttachmentButton({ ref }: AttachmentButtonScheme) {
  return (
    <button
      className="h-full cursor-pointer aspect-square"
      onClick={() => ref.current?.click()}
    >
      <i className="bi bi-paperclip text-white inline-block transform rotate-45 text-[25px]"></i>
    </button>
  );
}
