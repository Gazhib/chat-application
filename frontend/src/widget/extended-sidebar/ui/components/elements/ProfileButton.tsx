import SidebarElement from "../SidebarElement";

export default function ProfileButton({
  handleProfile,
  user,
  pp,
}: {
  handleProfile: () => void;
  user: { profilePicture?: string; login?: string };
  pp: string;
}) {
  return (
    <SidebarElement onClick={handleProfile}>
      <img
        className="rounded-full w-[50px] h-[50px] object-cover"
        src={user?.profilePicture === "Empty" ? pp : user?.profilePicture}
      />
      <div className="absolute w-[10px] h-[10px] bg-green-600 rounded-full left-[55px] bottom-[5px]" />
      <span className="text-[18px]">{user?.login}</span>
    </SidebarElement>
  );
}
