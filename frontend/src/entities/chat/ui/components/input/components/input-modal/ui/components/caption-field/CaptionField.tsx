export default function CaptionField({
  caption,
  handleCaption,
}: {
  caption: string;
  handleCaption: (value: string) => void;
}) {
  return (
    <section className="">
      <span className="text-white text-[14px]">Caption</span>
      <input
        className="w-full text-white border-b-[1.5px] border-[#666666] outline-none "
        value={caption}
        onChange={(e) => handleCaption(e.target.value)}
      />
    </section>
  );
}
