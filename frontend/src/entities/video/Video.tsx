export default function Video({
  ref,
  className,
  muted = false,
}: {
  ref: React.RefObject<HTMLVideoElement | null>;
  className: string;
  muted?: boolean;
}) {
  return (
    <video
      autoPlay
      ref={ref}
      playsInline
      className={`rounded-[6px] ${className}`}
      muted={muted}
    />
  );
}
