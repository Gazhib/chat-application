import { redirect, useNavigate, useSearchParams } from "react-router";
import Auth from "../features/authentication/ui/Auth";
import { getKeyPair } from "../entities/chat/model/encryption";
import { authPort } from "../util/ui/ProtectedRoutes";
export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const isLogin = mode === "login";
  const isRegistration = mode === "registration";
  const navigate = useNavigate();
  if (!isLogin && !isRegistration) navigate("/auth?mode=login");

  return (
    <main className="w-full h-full flex lg:flex-row items-center flex-col">
      <Auth mode={mode || ""} />
      <section className="flex-1 bg-black h-full lg:flex items-center justify-center hidden ">
        <span className="text-white text-[16px]">
          I still do not know what to add here
        </span>
      </section>
    </main>
  );
}

export async function action({ request }: { request: Request }) {
  const fd = await request.formData();
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const fetchUrl = `${authPort}/api/${mode}`;

  const login = fd.get("Login");
  const email = fd.get("Email");
  const password = fd.get("Password");
  const confirmPassword = fd.get("Confirm password");

  if (mode === "login" || mode === "registration") {
    const response = await fetch(fetchUrl, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ login, password, confirmPassword, email }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (response.ok) {
      getKeyPair();
      if (mode === "login") {
        return redirect("/chats");
      }

      return redirect(`/verify?email=${encodeURIComponent(String(email))}`);
    } else {
      return {
        message:
          responseData ||
          `${mode === "login" ? "Login" : "Registration"} failed`,
      };
    }
  } else {
    return redirect("/auth?mode=login");
  }
}
