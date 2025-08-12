import Video from "@/entities/video/ui/Video";

export default function VideoContainer({
  userVideo,
  companionVideo,
}: {
  userVideo: React.RefObject<HTMLVideoElement | null>;
  companionVideo: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <section className="w-full flex-3 flex flex-row justify-around items-center px-[20px] py-[20px]">
      <article className="h-[60%] relative">
        <Video
          ref={userVideo}
          className="h-[30%] absolute bottom-0 right-0"
          muted
        />
        <Video ref={companionVideo} className="h-full" />
      </article>
    </section>
  );
}
