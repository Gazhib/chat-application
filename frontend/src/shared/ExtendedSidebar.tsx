import { motion, type MotionProps } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";

interface ExtendedSidebar extends MotionProps {
  handleLogout: () => void;
  handleBurger: () => void;
}

function mergeRefs<T = any>(
  ...refs: React.ForwardedRef<T>[]
): React.RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (ref) {
        if (typeof ref === "function") ref(node);
        if ("current" in ref) ref.current = node;
      }
    }
  };
}

export const ExtendedSidebar = forwardRef<HTMLDivElement, ExtendedSidebar>(
  ({ handleBurger, handleLogout, ...rest }, ref) => {
    const clickRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        if (
          clickRef.current &&
          !clickRef.current.contains(event.target as Node)
        ) {
          handleBurger();
        }
      };

      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
      <motion.aside
        {...(rest as MotionProps)}
        ref={mergeRefs(ref, clickRef)}
        className={`h-[calc(100%)] transform transition-all duration-300 fixed z-51 w-[320px] bg-[#222222] text-[28px] text-white flex flex-col justify-between py-[10px]`}
      >
        <div
          className="flex flex-row items-center gap-[10px] cursor-pointer w-full hover:bg-[#555555] py-[5px] px-[20px]"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right text-[24px]" />
          <span className="text-[18px]">Logout</span>
        </div>
      </motion.aside>
    );
  }
);

export const AnimatedExtendedSidebar = motion(ExtendedSidebar);
