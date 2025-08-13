import MicrophoneButton from "./components/MicrophoneButton";
import PhoneButton from "./components/PhoneButton";
import ScreenButton from "./components/ScreenButton";
import VideoButton from "./components/VideoButton";

export default function VideoToolbar({}: {}) {
  return (
    <section className="text-white flex-1 flex items-center justify-center">
      <main className="px-[20px] py-[10px] flex flex-row gap-[10px]">
        <ScreenButton />
        <PhoneButton />
        <MicrophoneButton />
        <VideoButton />
      </main>
    </section>
  );
}
