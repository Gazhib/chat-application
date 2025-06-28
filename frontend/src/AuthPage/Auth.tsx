import { Form, Link } from "react-router";
import AuthInput from "./Components/AuthInput";

type Props = {
  mode: string;
};

export default function Auth({ mode }: Props) {
  const isLogin = mode === "login";
  return (
    <Form
      method="post"
      className="flex-1 h-full w-full flex items-center justify-center"
    >
      <div className="w-[500px] gap-[40px] h-full flex flex-col justify-center">
        <header className="flex flex-col items-center text-center justify-center">
          <span className="text-[34px]">Welcome {isLogin && "back"}</span>
          <span className="text-[14px] text-[#636364]">
            Welcome {isLogin && "back"}! Please enter your details{" "}
            {!isLogin && "for registration"}
          </span>
        </header>
        <section className="flex flex-col items-center gap-[10px]">
          <AuthInput
            placeholder="Enter login or email"
            name="Login or email"
            label="Login or Email"
          />
          <AuthInput
            placeholder="Enter password"
            name="Password"
            label="Password"
          />
          {!isLogin && (
            <AuthInput
              placeholder="Enter confirm password"
              name="Confirm password"
              label="Confirm password"
            />
          )}
        </section>
        <footer className="flex flex-col w-full gap-[20px]">
          <div className="flex flex-row justify-between items-center">
            <label className="flex flex-row gap-[5px] cursor-pointer items-center">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            {isLogin && (
              <Link className="underline hover:text-gray-600" to={`/nowhere`}>
                Forgot password?
              </Link>
            )}
          </div>
          <section className="w-full justify-center items-center">
            <button className="rounded-[10px] h-[40px] cursor-pointer w-full bg-black hover:bg-black/70 text-white hover:text-gray-200">
              {isLogin ? "Login" : "Register"}
            </button>
          </section>
          <span className="flex flex-row gap-[5px]">
            {isLogin ? "Dont" : "Already"} have an account?
            <Link
              className="underline hover:text-gray-600"
              to={`/auth?mode=${isLogin ? "registration" : "login"}`}
            >
              {!isLogin
                ? "Login to account"
                : "Register in less than 5 minutes!"}
            </Link>
          </span>
        </footer>
      </div>
    </Form>
  );
}
