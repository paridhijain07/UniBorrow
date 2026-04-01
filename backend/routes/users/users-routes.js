const express = require("express");

const auth = require("../../middleware/auth");
const {
  validateRequest,
  userIdParamValidation,
  updateProfileValidation,
} = require("../../middleware/validate");

const {
  getUserPublic,
  updateMyProfile,
  getReviewsReceived,
  getUserCount,
} = require("../../controllers/users/users-controller");

const router = express.Router();

router.get("/count", getUserCount);

router.get("/:id/reviews", userIdParamValidation, validateRequest, getReviewsReceived);
router.get("/:id", userIdParamValidation, validateRequest, getUserPublic);
router.put(
  "/profile",
  auth,
  updateProfileValidation,
  validateRequest,
  updateMyProfile
);

module.exports = router;

