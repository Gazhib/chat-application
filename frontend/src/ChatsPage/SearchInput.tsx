interface SearchInput {
  typed: string;
  setTyped: (value: string) => void;
}

export default function SearchInput({ typed, setTyped }: SearchInput) {
  return (
    <input
      value={typed}
      onChange={(e) => setTyped(e.target.value)}
      placeholder="Search"
      className="px-[10px] h-[35px] w-[90%] text-[14px] placeholder-[#72767D] focus:border-[2D88FF] text-white bg-[#2E2F33] rounded-full"
    />
  );
}
