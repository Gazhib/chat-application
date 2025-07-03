import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { getInfo } from "../store/userReducer";
import { useAppDispatch } from "../store/hooks";

export default function ProtectedRoutes() {
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
        if (!response.ok) {
          setUser(null);
          dispatch(
            getInfo({
              email: "",
              login: "",
              role: "",
              id: "",
            })
          );
          return;
        }
        const responseData = await response.json();
        if (!responseData.isVerified) {
          navigate(`/verify?email=${responseData.email}`);
        }
        if (responseData && responseData.isVerified) {
          const login = responseData.login;

          if (login) {
            dispatch(
              getInfo({
                email: responseData.email,
                login: responseData.login,
                role: responseData.role,
                id: responseData.id,
              })
            );
            setUser(responseData);
          }
        }
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
