export default function Meta({
  handleOpenPhoto,
  meta,
  picture,
  time,
}: {
  handleOpenPhoto: () => void;
  meta: string;
  picture: string | undefined;
  time: string;
}) {
  return (
    <div className={`flex flex-row gap-[10px] items-end relative `}>
      <section className="flex flex-col">
        <img
          onClick={handleOpenPhoto}
          src={picture}
          className="block w-full max-w-[420px]  h-auto object-cover cursor-pointer"
        />
        <span className="break-all">{meta}</span>
      </section>

      <span className="text-[10px] text-gray-500 self-end bottom-[-10px]">
        {time}
      </span>
    </div>
  );
}
