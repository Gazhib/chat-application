const crypto = require("crypto");
const { getPicture, putPicture } = require("../bucket");

const randomImageName = () => crypto.randomUUID().toString();

const uploadPicture = async (file) => {
  const imageName = randomImageName();
  await putPicture({ file, imageName });
  return imageName;
};

const getPictureUrl = async (imageName) => {
  if (!imageName) return null;
  return getPicture({ imageName });
};

module.exports = { uploadPicture, getPictureUrl, randomImageName };
