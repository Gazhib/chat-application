export default function SendButton({sendMessage}: {sendMessage: () => void}) {
  return (
    <button
      onClick={sendMessage}
      className="absolute right-[15px] h-full text-center cursor-pointer relative"
    >
      <i className="bi bi-send-fill text-white text-[18px]"></i>
    </button>
  );
}
