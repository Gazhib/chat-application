import { Form, Link, useActionData, useNavigation } from "react-router";
import AuthInput from "./Components/AuthInput";

type Props = {
  mode: string;
};

export default function Auth({ mode }: Props) {
  const isLogin = mode === "login";
  const errorMessage = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  console.log(errorMessage);
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
          <AuthInput placeholder="Enter login" name="Login" label="Login" />
          {!isLogin && (
            <AuthInput
              placeholder="Enter email"
              name="Email"
              label="Email"
              type="email"
            />
          )}
          <AuthInput
            placeholder="Enter password"
            name="Password"
            label="Password"
            type="password"
          />
          {!isLogin && (
            <AuthInput
              placeholder="Enter confirm password"
              name="Confirm password"
              label="Confirm password"
              type="password"
            />
          )}
          {errorMessage && (
            <span className="text-red-600">{errorMessage.message}</span>
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
              {isLogin ? (isSubmitting ? "Logging in..." : "Login") : (isSubmitting ? "Registering..." : "Register")}
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
