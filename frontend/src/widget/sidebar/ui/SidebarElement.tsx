interface SidebarElementScheme {
  className?: string;
  description?: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
  label: string;
  onClick?: () => void;
}

export default function SidebarElement({
  className = "",
  description,
  icon,
  isCollapsed,
  label,
  onClick,
}: SidebarElementScheme) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`group flex w-full cursor-pointer items-center overflow-hidden px-3 py-3 text-left text-white transition-all duration-300 ease-out hover:bg-[#555555] ${
        isCollapsed ? "justify-center" : "justify-start"
      } ${className}`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center transition-all duration-300">
        {icon}
      </div>

      <div
        aria-hidden={isCollapsed}
        className={`min-w-0 overflow-hidden transition-all duration-300 ease-out ${
          isCollapsed
            ? "ml-0 max-w-0 opacity-0"
            : "ml-3 max-w-[180px] opacity-100"
        }`}
      >
        <p className="truncate text-[15px] font-semibold leading-5 text-current">
          {label}
        </p>
        {description ? (
          <p className="truncate text-[12px] leading-4 text-[#b7bcc7]">
            {description}
          </p>
        ) : null}
      </div>
    </button>
  );
}
