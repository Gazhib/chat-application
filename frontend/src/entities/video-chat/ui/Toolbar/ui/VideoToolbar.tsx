import MicrophoneButton from "./MicrophoneButton";
import PhoneButton from "./PhoneButton";
import ScreenButton from "./ScreenButton";
import VideoButton from "./VideoButton";

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
