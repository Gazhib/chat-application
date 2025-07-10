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
        let response = await fetch("http://localhost:3000/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const refreshResponse = await fetch(
            "http://localhost:4000/api/refresh",
            {
              method: "GET",
              credentials: "include",
            }
          );
          if (refreshResponse.ok) {
            const { email, isVerified, login, role, id } =
              await refreshResponse.json();

            response = await fetch("http://localhost:3000/me", {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) {
              throw new Error("Could not authenticate");
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

            return;
          } else {
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
        }

        const { email, isVerified, login, role, id } = await response.json();
        if (!isVerified && email) {
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
        console.error(e);
      } finally {
        setChecked(true);
      }
    };
    checkUser();
  }, [dispatch, navigate]);

  if (!checked) return null;
  return user ? (
    <>
      <Outlet />
    </>
  ) : (
    <Navigate to="/auth?mode=login" />
  );
}
