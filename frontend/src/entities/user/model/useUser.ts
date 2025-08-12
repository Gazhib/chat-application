import { useNavigate } from "react-router";
import { useUserStore } from "./userZustand";
import { useState } from "react";
import { authPort, port } from "@/util/ui/ProtectedRoutes";

export const useUser = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const checkUser = async () => {
    try {
      const response = await fetch(`${port}/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const isOk = await refresh();
        if (!isOk) {
          setUser(undefined);
        }
      } else {
        const {
          email,
          isVerified,
          login,
          role,
          id,
          description,
          profilePicture,
        } = await response.json();
        if (isVerified === false && email) {
          navigate(`/verify?email=${email}`);
        }
        if (isVerified) {
          setUser({ email, login, role, id, description, profilePicture });
        }
      }
    } catch (e) {
      setUser(undefined);
      console.log(e);
    } finally {
      return true;
    }
  };

  const refresh = async () => {
    const refreshResponse = await fetch(`${authPort}/api/refresh`, {
      method: "GET",
      credentials: "include",
    });
    if (refreshResponse.ok) {
      const {
        email,
        isVerified,
        login,
        role,
        id,
        description,
        profilePicture,
      } = await refreshResponse.json();
      if (isVerified) {
        setUser({ email, login, role, id, description, profilePicture });
      }
    } else {
      setUser(undefined);
      return false;
    }
    return true;
  };

  const [userDescription, setUserDescription] = useState("");
  const [isChangingDescription, setIsChangingDescription] = useState(false);
  const [typed, setTyped] = useState("");

  const handleChangeDescription = async () => {
    const response = await fetch(`${port}/change-user-description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user?.id, description: typed }),
    });

    if (!response.ok) {
      console.error("Failed to change description");
      return;
    }
    setUserDescription(typed);
    setIsChangingDescription(false);
  };

  const handleTyping = (value: string) => {
    setTyped(value);
  };

  return {
    checkUser,
    handleChangeDescription,
    userDescription,
    isChangingDescription,
    setIsChangingDescription,
    handleTyping,
    user,
  };
};
