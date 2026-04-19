const express = require("express");
const { tokenMiddleware } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const authRoutes = require("./authRoutes");
const messageRoutes = require("./messageRoutes");
const userRoutes = require("./userRoutes");
const chatRoutes = require("./chatRoutes");
const callRoutes = require("./callRoutes");
const keyRoutes = require("./keyRoutes");
const userController = require("../controllers/userController");

const router = express.Router();

router.use("/api", authRoutes);
router.use("/messages", messageRoutes);
router.use("/users", userRoutes);
router.use("/chats", chatRoutes);
router.use("/calls", callRoutes);
router.use("/", keyRoutes);

// Root-level routes preserved from the original monolithic app.js
router.get("/me", tokenMiddleware, userController.getCurrentUser);
router.patch(
  "/user-description",
  tokenMiddleware,
  userController.updateDescription
);
router.patch(
  "/profile-picture",
  tokenMiddleware,
  upload.single("image"),
  userController.updateProfilePicture
);

module.exports = router;
