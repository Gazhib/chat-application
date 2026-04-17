const express = require("express");
const { tokenMiddleware } = require("../middleware/auth");
const keyController = require("../controllers/keyController");

const router = express.Router();

router.post("/public-key", tokenMiddleware, keyController.updatePublicKey);
router.get("/peer-public-key", tokenMiddleware, keyController.getPeerPublicKey);
router.post(
  "/peer-public-key",
  tokenMiddleware,
  keyController.getPeerPublicKey
);

module.exports = router;
