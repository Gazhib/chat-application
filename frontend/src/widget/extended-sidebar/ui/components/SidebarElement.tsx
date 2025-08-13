interface SidebarElementScheme {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SidebarElement({
  children,
  className = "",
  onClick,
}: SidebarElementScheme) {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-row items-center gap-[10px] cursor-pointer w-full hover:bg-[#555555] py-[5px] px-[20px] flex-1 max-h-[60px] ${className}`}
    >
      {children}
    </div>
  );
}
