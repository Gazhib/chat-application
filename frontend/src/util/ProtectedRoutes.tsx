import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoutes() {
  const [user, setUser] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setUser(true);
    setChecked(true);
  }, []);
  if (!checked) return null;
  return user ? <Outlet /> : <Navigate to="/auth?mode=login" />;
}
