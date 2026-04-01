const express = require("express");

const auth = require("../../middleware/auth");
const {
  validateRequest,
  reviewCreateValidation,
  reviewItemIdValidation,
  reviewUserIdValidation,
} = require("../../middleware/validate");

const {
  createReview,
  getReviewsForItem,
  getReviewsForUser,
} = require("../../controllers/reviews/reviews-controller");

const router = express.Router();

router.post("/", auth, reviewCreateValidation, validateRequest, createReview);

router.get(
  "/item/:itemId",
  reviewItemIdValidation,
  validateRequest,
  getReviewsForItem
);

router.get(
  "/user/:userId",
  reviewUserIdValidation,
  validateRequest,
  getReviewsForUser
);

module.exports = router;

