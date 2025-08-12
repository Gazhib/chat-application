export default function ToolbarButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button className="bg-[#333333] rounded-full aspect-square px-[20px] cursor-pointer">
      {children}
    </button>
  );
}
