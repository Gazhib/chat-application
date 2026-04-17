const express = require("express");
const { tokenMiddleware } = require("../middleware/auth");
const callController = require("../controllers/callController");

const router = express.Router();

router.post("/", tokenMiddleware, callController.createCall);
router.get("/:callId", tokenMiddleware, callController.verifyCall);
router.delete("/:callId", tokenMiddleware, callController.disconnectCall);

module.exports = router;
