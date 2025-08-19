import { Link } from "react-router";

export default function CallMessage({
  time,
  callId,
  finishedAt,
}: {
  time: string;
  callId: string;
  finishedAt: string | Date | undefined;
}) {
  console.log(finishedAt);
  return (
    <div className={`flex flex-row gap-[10px] items-end relative `}>
      <section className="flex flex-col">
        <Link
          target="_blank"
          rel="noopener noreferrer"
          to={`/call/${callId}`}
          className="cursor-pointer bg-green-600 px-[10px] py-[5px] rounded-[6px]"
        >
          Accept call
        </Link>
        {finishedAt ? (
          <button className="cursor-pointer">
            Finished call, {finishedAt.toLocaleString()}
          </button>
        ) : (
          <></>
        )}
      </section>

      <span className="text-[10px] text-gray-500 self-end bottom-[-10px]">
        {time}
      </span>
    </div>
  );
}
