import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

export default function RootLayout() {
  const navigate = useNavigate();
  const path = useLocation();
  useEffect(() => {
    if (path.pathname === "/") navigate("/auth?mode=login");
  });
  return <Outlet />;
}
