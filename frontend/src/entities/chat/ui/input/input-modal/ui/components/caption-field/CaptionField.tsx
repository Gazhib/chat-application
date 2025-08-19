export default function CaptionField({
  caption,
  handleCaption,
  picture,
  handleSendMessage,
}: {
  picture: string | undefined;
  caption: string;
  handleCaption: (value: string) => void;
  handleSendMessage: (value: string | undefined) => void;
}) {
  return (
    <section className="">
      <span className="text-white text-[14px]">Caption</span>
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSendMessage(picture);
        }}
        className="w-full text-white border-b-[1.5px] border-[#666666] outline-none "
        value={caption}
        onChange={(e) => handleCaption(e.target.value)}
      />
    </section>
  );
}
