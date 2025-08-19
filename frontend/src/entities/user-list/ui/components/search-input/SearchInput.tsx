import { useRef } from "react";

interface SearchInput {
  setTyped: (value: string) => void;
}

export default function SearchInput({ setTyped }: SearchInput) {
  const lastChange = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (value: string) => {
    if (lastChange.current) clearTimeout(lastChange.current);

    lastChange.current = setTimeout(() => {
      lastChange.current = null;
      setTyped(value);
    }, 300);
  };

  return (
    <input
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Search"
      className="px-[10px] h-[35px] w-[90%] text-[14px] placeholder-[#72767D] focus:border-[2D88FF] text-white bg-[#2E2F33] rounded-full"
    />
  );
}
