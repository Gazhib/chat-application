import pp from "/pp.png";
type Props = {
  message: string;
  place: string;
};
export default function MessageBubble({ message, place }: Props) {
  return (
    <div
      className="max-w-[40%] flex flex-row gap-[10px]"
      style={{
        alignSelf: place === "right" ? "end" : "start",
        flexDirection: place === "right" ? "row-reverse" : "row",
      }}
    >
      <img
        className="rounded-full h-[40px] w-[40px] object-cover self-end"
        src={pp}
      />
      <span
        style={{
          backgroundColor: place === "right" ? "#3A3B3C" : "#2F3136",
          borderBottomLeftRadius: place === "right" ? "16px" : "0px",
          borderBottomRightRadius: place === "right" ? "0px" : "16px",
        }}
        className="px-[15px] py-[10px] rounded-t-[16px] text-[#E4E6EB] relative max-w-[100%] break-words"
      >
        <span className="">{message}</span>
      </span>
    </div>
  );
}
