const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../../controllers/auth/auth-controller");

const auth = require("../../middleware/auth");
const {
  registerValidation,
  loginValidation,
  validateRequest,
} = require("../../middleware/validate");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, registerUser);
router.post("/login", loginValidation, validateRequest, loginUser);
router.get("/me", auth, getMe);

module.exports = router;