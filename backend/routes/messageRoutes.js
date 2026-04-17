const express = require("express");
const { tokenMiddleware } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.post(
  "/",
  tokenMiddleware,
  upload.single("image"),
  messageController.createMessage
);
router.patch("/:messageId", tokenMiddleware, messageController.markMessageRead);
router.delete("/:messageId", tokenMiddleware, messageController.deleteMessage);

module.exports = router;
