import { Link } from "react-router";

export default function CallMessage({
  time,
  callId,
  finishedAt,
  handleCall,
}: {
  time: string;
  callId: string;
  finishedAt: string | Date | undefined;
  handleCall: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 items-end relative">
      <section className="flex flex-col">
        {finishedAt ? (
          <button
            onClick={handleCall}
            className="cursor-pointer flex flex-row items-center gap-4"
          >
            <div className="flex flex-col">
              <span className="font-medium">Finished call</span>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <i className="bi bi-telephone-fill text-red-600 rotate-180"></i>
                <span>
                  {new Date(finishedAt).toLocaleTimeString().slice(0, 5)}
                </span>
              </div>
            </div>
            <i className="bi bi-telephone-fill text-lg text-gray-700"></i>
          </button>
        ) : (
          <Link
            to={`/call/${callId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            Accept call
          </Link>
        )}
      </section>

      {!finishedAt && (
        <span className="text-xs text-gray-500 self-end -mb-2">{time}</span>
      )}
    </div>
  );
}
