interface AttachmentInputScheme {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ref: React.RefObject<HTMLInputElement | null>;
}
export default function AttachmentInput({
  onChange,
  ref,
}: AttachmentInputScheme) {
  return <input onChange={onChange} type="file" hidden ref={ref} />;
}
