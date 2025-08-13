import Video from "@/entities/video/ui/Video";

export default function VideoContainer({
  userVideo,
  companionVideo,
}: {
  userVideo: React.RefObject<HTMLVideoElement | null>;
  companionVideo: React.RefObject<HTMLVideoElement | null>;
}) {
  return (
    <section className="w-full flex-3 flex flex-row justify-around items-center py-[20px]">
      <article className="h-[60%] max-w-[calc(100%-100px)] relative">
        <Video
          ref={userVideo}
          className="h-[30%] absolute bottom-0 right-0"
          muted
        />
        <Video ref={companionVideo} className="h-full max-w-[70%]" />
      </article>
    </section>
  );
}
