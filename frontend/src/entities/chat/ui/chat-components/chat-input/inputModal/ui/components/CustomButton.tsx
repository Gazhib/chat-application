interface CustomButtonScheme {
  children: string;
  onClick: () => void;
}

export default function CustomButton({
  children,
  onClick,
}: CustomButtonScheme) {
  return <button className="cursor-pointer hover:text-[#999999]" onClick={onClick}>{children}</button>;
}
