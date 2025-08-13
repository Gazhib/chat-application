import { Link } from "react-router";

export default function CallMessage({
  time,
  callId,
}: {
  time: string;
  callId: string;
}) {
  return (
    <div className={`flex flex-row gap-[10px] items-end relative `}>
      <section className="flex flex-col">
        <Link to={`/call/${callId}`} className="cursor-pointer bg-green-600 px-[10px] py-[5px] rounded-[6px]">
          Accept call
        </Link>
      </section>

      <span className="text-[10px] text-gray-500 self-end bottom-[-10px]">
        {time}
      </span>
    </div>
  );
}
