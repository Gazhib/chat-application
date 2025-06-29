import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoutes() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/me", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          setUser(null);
          return;
        }
        const responseData = await response.json();
        const login = responseData.login;
        if (login) setUser(login);
      } catch (e) {
        console.log(e);
      } finally {
        setChecked(true);
      }
    };
    checkUser();
  }, []);
  if (!checked) return null;
  return user ? <Outlet /> : <Navigate to="/auth?mode=login" />;
}
