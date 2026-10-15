const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");
const { auth, admin } = require("../../middleware/auth");

const router = express.Router();

router.post("/upload-image", auth, admin, upload.single("my_file"), handleImageUpload);
router.post("/add", auth, admin, addProduct);
router.put("/edit/:id", auth, admin, editProduct);
router.delete("/delete/:id", auth, admin, deleteProduct);
router.get("/get", auth, admin, fetchAllProducts);

module.exports = router;