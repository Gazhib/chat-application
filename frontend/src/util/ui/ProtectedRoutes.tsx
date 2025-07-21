import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useUser } from "../../entities/user/model/useUser";
import { useUserStore } from "../model/store/zustand";

export const port = import.meta.env.VITE_APP_DF_PORT;
export const authPort = import.meta.env.VITE_APP_AUTH_PORT;

export default function ProtectedRoutes() {
  const [checked, setChecked] = useState(false);
  const user = useUserStore((state) => state.user);
  const { checkUser } = useUser();

  const navigate = useNavigate();
  useEffect(() => {
    const handle = async () => {
      setChecked(await checkUser());
    };
    handle();
  }, [navigate]);

  if (!checked) return null;
  return user ? (
    <>
      <Outlet />
    </>
  ) : (
    <Navigate to="/auth?mode=login" />
  );
}
