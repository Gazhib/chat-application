import { useContextMenu } from "../model/useContextMenu";
import type { MessageSchema } from "../../../../model/types";

export default function ContextMenu({
  message,
}: {
  message: MessageSchema;
}) {
  const messageId = message._id;
  const { options } = useContextMenu({ messageId: messageId ?? "" });


  return (
    <main
      className="h-full w-full bg-neutral-900"
    >
      {options.map(({ label, onClick }, i) => {
        const isLast = i === options.length - 1;
        return (
          <span
            onClick={onClick}
            key={`${label}-${i}`}
            className={`px-4 py-2 rounded-[6px] text-white bg-neutral-900 hover:bg-neutral-800 cursor-pointer ${
              isLast ? "" : "border-b-[1px]"
            } border-[#333333]`}
          >
            {label}
          </span>
        );
      })}
    </main>
  );
}
