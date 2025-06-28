export default function ChatInput() {
  return (
    <footer className="bottom-0 w-full bg-[#242526] h-[50px] relative">
      <input
        placeholder="Message..."
        className="h-full w-full placeholder-[#72767D] text-white text-[14px] px-[10px]"
      />
      <button className="absolute right-[15px] h-full text-center cursor-pointer">
        <i className="bi bi-send-fill text-white text-[18px]"></i>
      </button>
    </footer>
  );
}
