const express = require("express");

const auth = require("../../middleware/auth");
const {
  validateRequest,
  notificationIdValidation,
} = require("../../middleware/validate");

const {
  getNotifications,
  readAll,
  readOne,
  unreadCount,
} = require("../../controllers/notifications/notifications-controller");

const router = express.Router();

router.get("/", auth, getNotifications);
router.get("/unread-count", auth, unreadCount);

router.put("/read-all", auth, readAll);
router.put("/:id/read", auth, notificationIdValidation, validateRequest, readOne);

module.exports = router;

