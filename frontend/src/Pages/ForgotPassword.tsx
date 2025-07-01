import { Form, useActionData, useSearchParams } from "react-router";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");

  const actionData = useActionData();

  return (
    <Form
      className="flex h-full w-full flex-col items-center justify-center gap-[20px]"
      method="post"
      action="/verify"
    >
      <input
        className="h-[40px] w-[250px] pl-[15px] text-[14px] border-[1px] rounded-[6px] border-[rgba(218,218,218,1)]"
        type="email"
        name="email"
        value={email || ""}
        readOnly
      />
      <input
        className="h-[40px] w-[250px] pl-[15px] text-[14px] border-[1px] rounded-[6px] border-[rgba(218,218,218,1)]"
        type="text"
        name="code"
        placeholder="6-digit code"
      />
      <button
        type="submit"
        className="h-[40px] w-[250px] cursor-pointer px-[15px] text-[14px] border-[1px] rounded-[6px] border-[rgba(218,218,218,1)] hover:bg-grey-300"
      >
        Verify
      </button>
      {actionData && actionData.isFail && (
        <span className="text-red-600">{actionData.message}</span>
      )}
      {actionData && !actionData.isFail && <span>{actionData.message}</span>}
    </Form>
  );
}

export async function action({ request }: { request: Request }) {
  const fd = await request.formData();
  const email = fd.get("email");
  const verifyCode = fd.get("code");

  console.log(email, verifyCode);

  const response = await fetch("http://localhost:4000/api/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, verifyCode }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();

  if (!response.ok) return { isFail: true, message: responseData };

  return { isFail: false, message: responseData };
}
