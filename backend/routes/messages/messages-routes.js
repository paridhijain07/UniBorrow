const express = require("express");

const auth = require("../../middleware/auth");
const {
  validateRequest,
  createMessageValidation,
  getThreadUserValidation,
} = require("../../middleware/validate");

const {
  sendMessage,
  getConversations,
  getThread,
} = require("../../controllers/messages/messages-controller");

const router = express.Router();

router.post("/", auth, createMessageValidation, validateRequest, sendMessage);

router.get("/conversations", auth, getConversations);

router.get("/:userId", auth, getThreadUserValidation, validateRequest, getThread);

module.exports = router;

