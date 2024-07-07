const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../controllers/categoryController");

router.get("/getCategories", getAllCategories);
router.post("/createCategory", createCategory);

module.exports = router;