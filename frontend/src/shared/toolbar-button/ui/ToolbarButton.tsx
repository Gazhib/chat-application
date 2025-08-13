export default function ToolbarButton({
  onClick = () => {},
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#333333] rounded-full aspect-square px-[20px] cursor-pointer"
    >
      {children}
    </button>
  );
}
