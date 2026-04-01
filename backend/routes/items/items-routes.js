const express = require("express");

const auth = require("../../middleware/auth");
const {
  validateRequest,
  itemIdValidation,
  createItemValidation,
  updateItemValidation,
} = require("../../middleware/validate");

const {
  getItems,
  getMyListings,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../../controllers/items/items-controller");

const router = express.Router();

// Important: keep this route above `/:id`.
router.get("/user/my-listings", auth, getMyListings);

router.get("/", getItems);
router.get("/:id", itemIdValidation, validateRequest, getItemById);

router.post("/", auth, createItemValidation, validateRequest, createItem);
router.put(
  "/:id",
  auth,
  itemIdValidation,
  updateItemValidation,
  validateRequest,
  updateItem
);
router.delete(
  "/:id",
  auth,
  itemIdValidation,
  validateRequest,
  deleteItem
);

module.exports = router;

