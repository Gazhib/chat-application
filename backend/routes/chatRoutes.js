const express = require("express");
const { tokenMiddleware } = require("../middleware/auth");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/", tokenMiddleware, chatController.createChat);
router.get("/:chatId/messages", tokenMiddleware, chatController.getMessages);
router.get("/:chatId/companion", tokenMiddleware, chatController.getCompanion);

module.exports = router;
