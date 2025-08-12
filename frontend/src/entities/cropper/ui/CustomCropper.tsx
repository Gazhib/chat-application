import { useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface CustomCropperScheme {
  image: string;
  setCroppedAreaPixels: (cropped: Area) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function CustomCropper({
  image,
  setCroppedAreaPixels,
  buttonRef,
}: CustomCropperScheme) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dialogRef = useRef<HTMLDialogElement>(null);
  if (image) {
    dialogRef.current?.showModal();
  }
  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return (
    <dialog
      ref={dialogRef}
      className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [&:not([open])]:hidden flex flex-col gap-[20px] items-center justify-center inset-0 backdrop-blur-sm outline-none no-scrollbar w-full h-full bg-transparent"
    >
      <section className="relative w-[50%] h-[50%] bg-transparent">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={4 / 4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </section>
      <button
        onClick={() => buttonRef?.current?.click()}
        className="bg-white rounded-[6px] px-[10px] py-[5px] cursor-pointer"
      >
        Submit
      </button>
    </dialog>
  );
}
