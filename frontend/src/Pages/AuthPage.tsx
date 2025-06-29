import { redirect, useNavigate, useSearchParams } from "react-router";
import Auth from "../AuthPage/Auth";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const isLogin = mode === "login";
  const isRegistration = mode === "registration";
  const navigate = useNavigate();
  if (!isLogin && !isRegistration) navigate("/auth?mode=login");

  return (
    <main className="w-full h-full flex flex-row items-center">
      <Auth mode={mode || ""} />
      <section className="flex-1">has</section>
    </main>
  );
}

export async function action({ request }: { request: Request }) {
  const fd = await request.formData();
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const fetchUrl = `http://localhost:4000/api/${mode}`;

  const login = fd.get("Login");
  const password = fd.get("Password");
  const confirmPassword = fd.get("Confirm password");

  if (mode === "login" || mode === "registration") {
    const response = await fetch(fetchUrl, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ login, password, confirmPassword }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (response.ok) {
      return redirect("/chats");
    } else {
      return {
        message:
          responseData.message ||
          `${mode === "login" ? "Login" : "Registration"} failed`,
      };
    }
  } else {
    return redirect("/auth?mode=login");
  }
}
