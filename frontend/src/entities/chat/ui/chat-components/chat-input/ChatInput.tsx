type Props = {
  typed: string;
  handleTyped: (value: string) => void;
  handleSendMessage: () => void;
};

export default function ChatInput({
  typed,
  handleTyped,
  handleSendMessage,
}: Props) {
  return (
    <footer className="bottom-0 w-full bg-[#242526] h-[50px] relative">
      <input
        value={typed}
        onChange={(e) => {
          handleTyped(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSendMessage();
        }}
        placeholder="Message..."
        className="h-full w-full focus:outline-none placeholder-[#72767D] text-white text-[14px] px-[10px]"
      />
      <button
        onClick={() => handleSendMessage()}
        className="absolute right-[15px] h-full text-center cursor-pointer"
      >
        <i className="bi bi-send-fill text-white text-[18px]"></i>
      </button>
    </footer>
  );
}
