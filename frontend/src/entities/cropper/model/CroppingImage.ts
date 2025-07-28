import type { Area } from "react-easy-crop";

export const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

/**
 * Returns the new bounding area of a rotated rectangle.
 */

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image: HTMLImageElement = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  // set canvas size to match the bounding box
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;


  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // As Base64 string
  // return canvas.toDataURL("image/png");

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      file && resolve(URL.createObjectURL(file));
    }, "image/png");
  });
}
