const express = require("express");
const router = express.Router();
const { getAllCategories, addCategoryToUser, getUserCategories } = require("../controllers/categoryController");

router.get("/getCategories", getAllCategories);
router.post("/addUserCategories", addCategoryToUser);
router.get("/getUserCategories", getUserCategories);

module.exports = router;