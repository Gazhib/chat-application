import { motion, type MotionProps } from "framer-motion";
import { forwardRef, useEffect, useRef } from "react";
import pp from "/pp.png";
import { useUserStore } from "../../../entities/user/model/userZustand";
interface ExtendedSidebar extends MotionProps {
  handleLogout: () => void;
  handleExtension: () => void;
  handleOpenModal: () => void;
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
  ({ handleExtension, handleLogout, handleOpenModal, ...rest }, ref) => {
    const clickRef = useRef<HTMLDivElement | null>(null);
    const user = useUserStore((state) => state.user);

    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        if (
          clickRef.current &&
          !clickRef.current.contains(event.target as Node)
        ) {
          handleExtension();
        }
      };

      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleProfile = () => {
      handleExtension();
      handleOpenModal();
    };

    return (
      <motion.aside
        {...(rest as MotionProps)}
        ref={mergeRefs(ref, clickRef)}
        className={`h-[calc(100%)] transform transition-all duration-300 fixed z-51 w-[320px] bg-[#222222] text-[28px] text-white flex flex-col justify-between py-[10px]`}
      >
        <div
          onClick={handleProfile}
          className="relative flex flex-row items-center gap-[10px] cursor-pointer w-full hover:bg-[#555555] py-[5px] px-[20px]"
        >
          <img
            className="rounded-full w-[50px] h-[50px] object-cover"
            src={user?.profilePicture === "Empty" ? pp : user?.profilePicture}
          />
          <div className="absolute w-[10px] h-[10px] bg-green-600 rounded-full left-[55px] bottom-[5px]" />
          <span className="text-[18px]">{user?.login}</span>
        </div>

        <div
          className="flex flex-row items-center gap-[10px] cursor-pointer w-full hover:bg-[#555555] py-[5px] px-[20px] self-end"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right text-[24px]" />
          <span className="text-[18px]">Logout</span>
        </div>
      </motion.aside>
    );
  }
);

export const AnimatedExtendedSidebar = motion.create(ExtendedSidebar);
