interface Sidebar {
  handleBurger: () => void;
}

export default function Sidebar({ handleBurger }: Sidebar) {
  return (
    <aside
      // style={{ width: isBurger ? "150px" : "50px" }}
      className={`h-[calc(100%)] transform transition-all duration-300 fixed z-50 w-[50px] bg-[#1E1F22] text-[28px] text-white flex flex-col justify-between py-[10px] px-[11px]`}
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
