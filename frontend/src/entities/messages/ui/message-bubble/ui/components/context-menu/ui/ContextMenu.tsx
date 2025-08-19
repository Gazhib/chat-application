import { useEffect, useRef } from "react";
import { useContextMenu } from "../model/useContextMenu";
import type { MessageSchema } from "../../../../model/types";

export default function ContextMenu({
  handleClickAway,
  message,
}: {
  handleClickAway: () => void;
  message: MessageSchema;
}) {
  const messageId = message._id;
  const { options } = useContextMenu({ messageId: messageId ?? "" });
  const clickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        clickRef.current &&
        !clickRef.current.contains(event.target as Node)
      ) {
        handleClickAway();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <main
      ref={clickRef}
      className="absolute w-auto h-auto bg-neutral-900 left-[-4rem] top-[-4rem] rounded-[6px] py-[2px]"
    >
      {options.map(({ label, onClick }, i) => {
        const isLast = i === options.length - 1;
        return (
          <section
            onClick={onClick}
            key={`${label}-${i}`}
            className={`py-[5px] px-[10px] text-white hover:bg-neutral-800 cursor-pointer ${
              isLast ? "" : "border-b-[1px]"
            } border-[#333333]`}
          >
            {label}
          </section>
        );
      })}
    </main>
  );
}
