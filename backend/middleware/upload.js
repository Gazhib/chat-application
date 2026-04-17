const multer = require("multer");

const MB = 1024 * 1024;
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * MB },
  fileFilter: (req, file, cb) =>
    cb(null, ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)),
});

module.exports = { upload };
