import { useRef, useState } from "react";
import { useUserStore, type userInfo } from "../../model/userZustand";
import pp from "/pp.png";
import { port } from "../../../../util/ui/ProtectedRoutes";
import { motion } from "framer-motion";
import CustomCropper from "../../../cropper/ui/CustomCropper";
import type { Area } from "react-easy-crop";
import getCroppedImg from "../../../cropper/model/CroppingImage";
export default function UserInfo({ user }: { user: userInfo | undefined }) {
  const setUser = useUserStore((state) => state.setUser);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();

  const changeProfilePicture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (croppedAreaPixels && previewUrl) {
        const curCroppedImage: string = await getCroppedImg(
          previewUrl,
          croppedAreaPixels
        );
        const blob = await fetch(curCroppedImage).then(r => r.blob())
        const newFile = new File([blob], "profile.png", {
          type: "image/png",
        });

        console.log(curCroppedImage.toString());

        const formData = new FormData();

        formData.append("image", newFile);
        formData.append("userId", user?.id || "");

        const response = await fetch(`${port}/update-profile-picture`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const { profilePicture }: { profilePicture: string } =
          await response.json();
        user && setUser({ ...user, profilePicture: profilePicture });
      }
    } catch (e) {
      console.error(e);
    }

    setIsSubmit(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const preview = URL.createObjectURL(e.target.files[0]);
      setPreviewUrl(preview);
      setIsSubmit(true);
    }
  };

  const [previewUrl, setPreviewUrl] = useState<string>();

  const [isSubmit, setIsSubmit] = useState(false);

  const [isHovering, setIsHovering] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <section className="flex flex-row gap-[20px] border-b-[1px] border-[#333333] pb-[20px]">
        <div className="relative w-[50px] h-[50px]">
          <form onSubmit={changeProfilePicture}>
            <input
              type="file"
              onChange={handleFile}
              accept="image/*"
              style={{ display: "none" }}
              ref={inputRef}
            />
            <img
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              src={user?.profilePicture === "Empty" ? pp : user?.profilePicture}
              className="absolute w-[50px] h-[50px] rounded-full object-cover"
            />
            {isHovering && (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 100 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: {
                    type: "tween",
                    bounce: 0,
                    ease: "linear",
                    duration: 0.1,
                  },
                }}
                onClick={() => inputRef.current?.click()}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="absolute cursor-pointer self-center bottom-[0px] bg-black/90 rounded-b-full w-[50px] flex items-center justify-center z-1"
              >
                <i className="bi bi-camera"></i>
              </motion.div>
            )}
            <button style={{ display: "none" }} type="submit" ref={buttonRef} />
          </form>
        </div>
        <div className="flex flex-col">
          <span>{user?.login}</span>
          <span>{user?.email}</span>
        </div>
      </section>
      {isSubmit && previewUrl && (
        <CustomCropper
          setCroppedAreaPixels={setCroppedAreaPixels}
          image={previewUrl}
          buttonRef={buttonRef}
        />
      )}
    </>
  );
}
