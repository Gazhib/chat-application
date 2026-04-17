const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "../.env" });

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ensureConfigured = () => {
  const missingVars = requiredEnvVars.filter((name) => !process.env[name]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing Cloudinary configuration: ${missingVars.join(", ")}`
    );
  }
};

const uploadFromBuffer = (file, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });

const putPicture = async ({ imageName, file }) => {
  ensureConfigured();

  const options = {
    public_id: imageName,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
  };

  if (process.env.CLOUDINARY_FOLDER) {
    options.folder = process.env.CLOUDINARY_FOLDER;
  }

  const result = await uploadFromBuffer(file, options);
  return {
    url: result.secure_url || result.url,
    public_id: result.public_id,
  };
};

const getPicture = ({ imageName }) => {
  ensureConfigured();
  return cloudinary.url(imageName, { secure: true, resource_type: "image" });
};

module.exports = { getPicture, putPicture };
