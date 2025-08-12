import { useUser } from "../../model/useUser";

export default function Description({
  userDescription,
  isMe,
}: {
  userDescription: string;
  isMe: boolean;
}) {
  const {
    isChangingDescription,
    handleTyping,
    handleChangeDescription,
    setIsChangingDescription,
  } = useUser();
  return (
    <section className="flex flex-col gap-[10px] mt-[20px]">
      <span className="text-[16px] font-semibold">Description</span>
      <div className="flex flex-row gap-[10px] items-center justify-between">
        {isChangingDescription ? (
          <>
            <input
              onChange={(e) => handleTyping(e.target.value)}
              max={100}
              type="text"
              defaultValue={userDescription}
              className="border-[1px] border-[#333333] rounded-[6px] px-[10px] py-[5px] flex-1 text-white bg-[#1E1F22] outline-none"
            />
            <button
              onClick={handleChangeDescription}
              className="self-center cursor-pointer text-white hover:text-green-500 rounded-[6px]"
            >
              <i className="bi bi-check" />
            </button>
          </>
        ) : (
          <>
            <span>{userDescription}</span>
            {isMe && (
              <button
                onClick={() => setIsChangingDescription((prev) => !prev)}
                className="text-[10px] cursor-pointer hover:text-orange-500 outline-none"
              >
                <i className="bi bi-pencil-square" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
