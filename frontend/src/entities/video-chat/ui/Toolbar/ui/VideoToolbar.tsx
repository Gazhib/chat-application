import MicrophoneButton from "./components/MicrophoneButton";
import PhoneButton from "./components/PhoneButton";

export default function VideoToolbar() {
  return (
    <section className="text-white flex-1 flex items-center justify-center">
      <main className="px-[20px] py-[10px] flex flex-row gap-[10px]">
        <PhoneButton />
        <MicrophoneButton />
      </main>
    </section>
  );
}
