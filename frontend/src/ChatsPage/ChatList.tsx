import { Link } from "react-router";
import pp from "/pp.png";
export default function ChatList() {
  const someRandomData = [
    {
      name: "Oleg",
      photo: pp,
      lastMessage: "Zdarova bratan",
      id: 1,
    },
    {
      name: "Marat",
      photo: pp,
      lastMessage: "Salam brat",
      id: 2,
    },
    {
      name: "Jason",
      photo: pp,
      lastMessage: "Wassup my boy",
      id: 3,
    },
  ];

  return (
    <ul>
      {someRandomData.map((contact) => {
        return (
          <Link
            to={`/chats/${contact.id}`}
            key={contact.id}
            className="h-[60px] items-center gap-[10px] flex flex-row border-b-[1px] border-[#333333] text-white cursor-pointer"
          >
            <img
              src={contact.photo}
              className="w-[50px] h-[50px] object-cover rounded-full"
            />
            <section className="flex flex-col justify-center">
              <span className="text-[16px]">{contact.name}</span>
              <span className="text-[12px] text-[#9A9C99]">{contact.lastMessage}</span>
            </section>
          </Link>
        );
      })}
    </ul>
  );
}
