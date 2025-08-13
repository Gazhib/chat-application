import { useSidebar } from "@/widget/extended-sidebar/model/useSidebar";

export const Sidebar = () => {
  const { handleExtension } = useSidebar();
  return (
    <aside
      className={`h-[calc(100%)] transform transition-all duration-300 fixed z-50 w-[50px] bg-[#1E1F22] text-[28px] text-white flex flex-col justify-between py-[10px] px-[11px]`}
    >
      <div>
        <i
          onClick={() => handleExtension()}
          className="bi bi-list cursor-pointer"
        ></i>
      </div>
    </aside>
  );
};
