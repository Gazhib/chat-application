import { useNavigate, useSearchParams } from "react-router";
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


export async function action(){
    
}
