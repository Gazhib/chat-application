import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function RootLayout() {
  return <Outlet />;
}
