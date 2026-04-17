const express = require("express");
const { tokenMiddleware } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", tokenMiddleware, userController.listCompanions);
router.post("/:userName", tokenMiddleware, userController.searchUsers);

module.exports = router;
