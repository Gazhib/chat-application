export default function TextMessageInput({
  typed,
  handleTyped,
  sendMessage,
}: {
  typed: string;
  handleTyped: (value: string) => void;
  sendMessage: () => void;
}) {
  return (
    <input
      value={typed}
      onChange={(e) => {
        handleTyped(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") sendMessage();
      }}
      placeholder="Message..."
      className="h-full w-full focus:outline-none placeholder-[#72767D] text-white text-[14px] px-[10px]"
    />
  );
}
