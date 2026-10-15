const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} = require("../../controllers/admin/order-controller");

const { auth, admin } = require("../../middleware/auth");

const router = express.Router();

router.get("/get", auth, admin, getAllOrdersOfAllUsers);
router.get("/details/:id", auth, admin, getOrderDetailsForAdmin);
router.put("/update/:id", auth, admin, updateOrderStatus);

module.exports = router;