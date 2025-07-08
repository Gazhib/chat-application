import { useEffect, useState } from "react";

interface ExtendedSidebar {
  handleLogout: () => void;
  handleBurger: () => void;
}

export default function ExtendedSidebar({ handleBurger }: ExtendedSidebar) {
  const [firstRender, setFirstRender] = useState(false);

  useEffect(() => {
    setFirstRender(true);
  }, []);

  return (
    <aside
      className={`h-[calc(100%)] transform transition-all duration-300 ${
        firstRender ? "translate-x-0" : "-translate-x-10"
      } fixed z-50 w-[200px] bg-[#1E1F22] text-[28px] text-white flex flex-col justify-between py-[10px] px-[11px]`}
    >
      <div>
        <i
          onClick={() => handleBurger()}
          className="bi bi-list cursor-pointer"
        ></i>
      </div>
    </aside>
  );
}
