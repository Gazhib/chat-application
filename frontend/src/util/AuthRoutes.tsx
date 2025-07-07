import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useAppDispatch } from "../store/hooks";
import { getInfo } from "../store/userReducer";

export default function AuthRoutes() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/me", {
          method: "GET",
          credentials: "include",
        });
        const { email, isVerified, login, role, id } = await response.json();
        if (isVerified === false && email) {
          navigate(`/verify?email=${email}`);
        }
        if (isVerified) {
          dispatch(
            getInfo({
              email,
              login,
              role,
              id,
            })
          );
          setUser(login);
        }
      } catch (e) {
        setUser(null);
        dispatch(
          getInfo({
            email: "",
            login: "",
            role: "",
            id: "",
          })
        );
        console.log(e);
      } finally {
        setChecked(true);
      }
    };
    checkUser();
  }, []);
  if (!checked) return null;
  return !user ? <Outlet /> : <Navigate to="/chats" />;
}
