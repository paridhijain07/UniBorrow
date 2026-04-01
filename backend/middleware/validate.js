const { body, validationResult } = require("express-validator");

const pickupZones = [
  "Library",
  "Canteen",
  "Hostel-A",
  "Hostel-B",
  "Hostel-C",
  "Main Gate",
  "Academic Block",
];

const itemCategories = [
  "Electronics",
  "Books",
  "Furniture",
  "Clothing",
  "Stationery",
  "Lab Equipment",
  "Hostel Essentials",
  "Bikes",
];

const itemConditions = ["New", "Like New", "Used", "Heavily Used"];
const listingTypes = ["Rent", "Exchange"];

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: "Validation error",
    errors: result.array(),
  });
};

const registerValidation = [
  body("name").isString().trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 6 }),
  body("pickupZone").isString().isIn(pickupZones),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
];

const { param } = require("express-validator");

const itemIdValidation = [param("id").isMongoId()];

const createItemValidation = [
  body("title").isString().trim().notEmpty(),
  body("description").isString().trim().notEmpty(),
  body("category").isString().isIn(itemCategories),
  body("condition").isString().isIn(itemConditions),
  body("listingType").isString().isIn(listingTypes),
  body("price").isNumeric({ min: 0 }),
  body("originalPrice").optional().isNumeric({ min: 0 }),
  body("images")
    .optional()
    .isArray({ max: 3 })
    .custom((arr) => arr.every((x) => typeof x === "string")),
  body("images.*").optional().isString().notEmpty(),
  body("tags")
    .optional()
    .isArray()
    .custom((arr) => arr.every((x) => typeof x === "string")),
  body("pickupLocation").isString().isIn(pickupZones),
  // Note: `status` is optional; if omitted it defaults to `available` in schema.
  body("status").optional().isString().isIn(["available", "rented", "reserved"]),
];

// For MVP: require full payload on update (same fields as create).
const updateItemValidation = createItemValidation;

const bookingIdValidation = [param("id").isMongoId()];

const createBookingValidation = [
  body("itemId").isMongoId(),
  body("startDate").isISO8601().toDate(),
  body("endDate").isISO8601().toDate(),
  body("startDate").custom((start, { req }) => {
    const end = req.body.endDate;
    if (!start || !end) return true;
    return new Date(start).getTime() <= new Date(end).getTime();
  }),
];

const messageIdValidation = [param("id").isMongoId()];

const createMessageValidation = [
  body("receiverId").isMongoId(),
  body("text").isString().trim().notEmpty(),
  body("itemId").optional().isMongoId(),
];

const getThreadUserValidation = [param("userId").isMongoId()];

const reviewCreateValidation = [
  body("bookingId").isMongoId(),
  body("overallRating").isInt({ min: 1, max: 5 }),
  body("priceRating").optional().isInt({ min: 1, max: 5 }),
  body("qualityRating").optional().isInt({ min: 1, max: 5 }),
  body("conditionRating").optional().isInt({ min: 1, max: 5 }),
  body("comment").optional().isString().trim().notEmpty(),
];

const reviewItemIdValidation = [param("itemId").isMongoId()];
const reviewUserIdValidation = [param("userId").isMongoId()];

const notificationIdValidation = [param("id").isMongoId()];

const userIdParamValidation = [param("id").isMongoId()];

const updateProfileValidation = [
  body("name").optional().isString().trim().notEmpty(),
  body("bio").optional().isString(),
  body("avatar").optional().isString().trim().notEmpty(),
  body("pickupZone").optional().isString().isIn(pickupZones),
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  itemIdValidation,
  createItemValidation,
  updateItemValidation,
  bookingIdValidation,
  createBookingValidation,
  createMessageValidation,
  getThreadUserValidation,
  reviewCreateValidation,
  reviewItemIdValidation,
  reviewUserIdValidation,
  notificationIdValidation,
  userIdParamValidation,
  updateProfileValidation,
};

