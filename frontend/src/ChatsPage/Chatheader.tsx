type Props = {
  name: string;
  status: string;
};

export default function ChatHeader({ name, status }: Props) {
  return (
    <header className="px-[20px] h-[60px] border-b-[1px] border-[#333333] flex flex-row text-white w-full justify-between items-center bg-[#242526] ">
      <section className="flex flex-col">
        <span className="text-[16px]">{name}</span>
        <span style={{color: status === "Online" ? "#21FF5F" : "#767876"}} className="text-[12px]">{status}</span>
      </section>
      <section className="flex flex-row gap-[15px]">
        <button><i className="bi bi-telephone-fill"></i></button>
        <button><i className="bi bi-three-dots-vertical"></i></button>
      </section>
    </header>
  );
}
