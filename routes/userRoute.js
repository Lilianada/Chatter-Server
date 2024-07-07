const { userLogin, userSignup } = require("../controllers/userControllers");
const express = require("express");
const router = express.Router();

router.post("/register", userSignup);

router.post("/login", userLogin);

module.exports = router;
