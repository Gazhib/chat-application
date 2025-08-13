import SidebarElement from "../SidebarElement";

export default function ChatsButton({
  handleNavigateChats,
}: {
  handleNavigateChats: () => void;
}) {
  return (
    <SidebarElement onClick={handleNavigateChats}>
      <span className="text-[18px]">Chats</span>
    </SidebarElement>
  );
}
