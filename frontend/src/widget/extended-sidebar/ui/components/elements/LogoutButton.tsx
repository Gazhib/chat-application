import SidebarElement from "../SidebarElement";

export default function LogoutButton({
  handleLogout,
}: {
  handleLogout: () => void;
}) {
  return (
    <SidebarElement onClick={handleLogout}>
      <i className="bi bi-box-arrow-right text-[24px]" />
      <span className="text-[18px]">Logout</span>
    </SidebarElement>
  );
}
