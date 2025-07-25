import { useEffect, useState } from "react";
import type { userInfo } from "../../model/userZustand";
import pp from "/pp.png";
import { port } from "../../../../util/ui/ProtectedRoutes";

export default function UserInfo({ user }: { user: userInfo | undefined }) {
  const [profilePicture, setProfilePicture] = useState<string>(pp);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const getProfilePicture = async () => {
      const response = await fetch(`${port}/get-profile-picture`, {
        method: "POST",
        body: JSON.stringify({ userId: user?.id }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const picture = await response.json();
      setProfilePicture(picture || pp);
    };
    getProfilePicture();
  });

  const changeProfilePicture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    if (file) {
      formData.append("image", file);
      formData.append("userId", user?.id || "");
    }

    const response = await fetch(`${port}/update-profile-picture`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const responseData = await response.json();
    setProfilePicture(responseData.profilePicture || pp);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <section className="flex flex-row gap-[20px] border-b-[1px] border-[#333333] pb-[20px]">
      <div className="relative w-[50px] h-[50px]">
        <img
          src={profilePicture}
          className="absolute w-[50px] h-[50px] rounded-full object-cover"
        />
        {/* <i className="absolute bi bi-camera bottom-0 self-center"></i> */}
      </div>
      <div className="flex flex-col">
        <span>{user?.login}</span>
        <span>{user?.email}</span>
        {/* <form onSubmit={changeProfilePicture}>
          <input type="file" onChange={handleFile} accept="image/*" />
          <button>Submit</button>
        </form> */}
      </div>
    </section>
  );
}
