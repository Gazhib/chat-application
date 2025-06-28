type Props = {
  placeholder?: string;
  label?: string;
  name?: string;
};

export default function AuthInput({ placeholder, label, name }: Props) {
  return (
    <div className="flex flex-col w-full gap-[5px]">
      {label ? <label className="text-[14px]">{label}</label> : null}
      <input className="h-[40px] pl-[15px] text-[14px] border-[1px] rounded-[6px] border-[rgba(218,218,218,1)] w-full" placeholder={placeholder} name={name} />
    </div>
  );
}
