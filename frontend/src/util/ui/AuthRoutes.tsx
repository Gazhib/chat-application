import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useUserStore } from "../model/store/zustand";
import { useUser } from "../../entities/user/model/useUser";

export default function AuthRoutes() {
  const [checked, setChecked] = useState(false);

  const user = useUserStore((state) => state.user);
  const { checkUser } = useUser();
  useEffect(() => {
    const handle = async () => {
      setChecked(await checkUser());
    };
    handle();
  }, []);
  if (!checked) return null;
  return !user ? <Outlet /> : <Navigate to="/chats" />;
}
