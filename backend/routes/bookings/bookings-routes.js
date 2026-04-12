const express = require("express");

const auth = require("../../middleware/auth");
const {
  validateRequest,
  bookingIdValidation,
  createBookingValidation,
} = require("../../middleware/validate");

const {
  createBooking,
  getMyRequests,
  getReceived,
  getBookingById,
  approveBooking,
  rejectBooking,
  returnBooking,
  getItemBookings
} = require("../../controllers/bookings/bookings-controller");

const router = express.Router();

router.post("/", auth, createBookingValidation, validateRequest, createBooking);

router.get("/my-requests", auth, getMyRequests);
router.get("/received", auth, getReceived);

router.get("/:id", auth, bookingIdValidation, validateRequest, getBookingById);

router.put(
  "/:id/approve",
  auth,
  bookingIdValidation,
  validateRequest,
  approveBooking
);

router.put(
  "/:id/reject",
  auth,
  bookingIdValidation,
  validateRequest,
  rejectBooking
);

router.put(
  "/:id/return",
  auth,
  bookingIdValidation,
  validateRequest,
  returnBooking
);
router.get("/item/:itemId", auth, getItemBookings);

module.exports = router;

