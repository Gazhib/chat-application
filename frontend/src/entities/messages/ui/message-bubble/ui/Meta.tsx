import type { EncryptionStatus } from "../types";

interface MetaProps {
  handleOpenPhoto: () => void;
  meta: string;
  picture: string | undefined;
  time: string;
  encryptionStatus?: EncryptionStatus;
}

export default function Meta({
  handleOpenPhoto,
  meta,
  picture,
  time,
  encryptionStatus,
}: MetaProps) {
  const renderContent = () => {
    if (encryptionStatus === "failed") {
      return (
        <span className="italic text-red-400 text-[13px]">
          Unable to decrypt message
        </span>
      );
    }
    if (encryptionStatus === "pending") {
      return (
        <span className="italic text-gray-500 text-[13px]">Decrypting…</span>
      );
    }
    return <span className="break-all">{meta}</span>;
  };

  return (
    <div className={`flex flex-row gap-[10px] items-end relative `}>
      <section className="flex flex-col">
        <img
          onClick={handleOpenPhoto}
          src={picture}
          className="block w-full max-w-[420px] h-auto object-cover cursor-pointer"
        />
        {renderContent()}
      </section>

      <span className="text-[10px] text-gray-500 self-end bottom-[-10px]">
        {time}
      </span>
    </div>
  );
}
