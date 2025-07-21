import { motion, type MotionProps } from "framer-motion";
import { forwardRef } from "react";

interface Sidebar extends MotionProps {
  handleExtension: () => void;
}

export const Sidebar = forwardRef<HTMLDivElement, Sidebar>(
  ({ handleExtension }, ref) => {
    return (
      <aside
        ref={ref}
        // style={{ width: isBurger ? "150px" : "50px" }}
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
  }
);

export const AnimatedSidebar = motion(Sidebar);
