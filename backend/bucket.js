const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config({ path: "../.env" });
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY;
const BUCKET_SECRET_ACCESS_KEY = process.env.BUCKET_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY,
    secretAccessKey: BUCKET_SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

const putPicture = async ({ imageName, file }) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: imageName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const putObjectCommand = new PutObjectCommand(params);

  await s3.send(putObjectCommand);
};

const getPicture = async ({ imageName }) => {
  const getObjectParams = {
    Bucket: BUCKET_NAME,
    Key: imageName,
  };
  const command = new GetObjectCommand(getObjectParams);
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};

module.exports = { getPicture, putPicture };
