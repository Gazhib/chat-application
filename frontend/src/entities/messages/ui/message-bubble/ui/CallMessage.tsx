type Props = {
  time: string;
  createdAt: string | Date;
  finishedAt: string | Date;
  isMe: boolean;
  handleCall: () => void;
};

export default function CallMessage({
  time,
  createdAt,
  finishedAt,
  isMe,
  handleCall,
}: Props) {
  const duration = formatDuration(createdAt, finishedAt);
  const label = isMe ? "Outgoing call" : "Incoming call";
  const arrowIcon = isMe ? "bi-telephone-outbound-fill" : "bi-telephone-inbound-fill";
  const tint = duration === null
    ? "bg-red-500/15 text-red-400"
    : "bg-green-500/15 text-green-400";

  return (
    <div className="flex flex-row gap-3 items-center min-w-[240px] py-1">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${tint}`}
      >
        <i className={`bi ${arrowIcon} text-base`}></i>
      </div>
      <div className="flex flex-col flex-1 leading-tight">
        <span className="font-medium text-sm text-[#E4E6EB]">{label}</span>
        <span className="text-xs text-gray-400">
          {duration ?? "Missed"} · {time}
        </span>
      </div>
      <button
        onClick={handleCall}
        aria-label="Call back"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#4A4B4D] hover:bg-[#5A5B5D] transition text-gray-200 cursor-pointer"
      >
        <i className="bi bi-telephone-fill text-sm"></i>
      </button>
    </div>
  );
}

function formatDuration(
  createdAt: string | Date,
  finishedAt: string | Date
): string | null {
  const created = new Date(createdAt);
  let finished: Date;

  if (typeof finishedAt === "string" && /^\d{1,2}:\d{2}$/.test(finishedAt)) {
    const [h, m] = finishedAt.split(":").map(Number);
    finished = new Date(created);
    finished.setHours(h, m, 0, 0);
    if (finished < created) finished.setDate(finished.getDate() + 1);
  } else {
    finished = new Date(finishedAt);
  }

  const ms = finished.getTime() - created.getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;

  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min ${s.toString().padStart(2, "0")} s`;
  return `${s} s`;
}
