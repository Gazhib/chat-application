import { Link } from "react-router";

export default function ErrorPage() {
  return (
    <main className="bg-[#18191A] h-full w-full text-white flex flex-col items-center justify-around ">
      <section>
        <span>You are in the wrong page</span>
      </section>
      <Link
        to="/chats"
        className="border-[1px] border-[#333333] px-[20px] py-[10px] rounded-[6px] transition duration-300 hover:bg-[#999999]"
      >
        <span>Go to the chats</span>
      </Link>
    </main>
  );
}
