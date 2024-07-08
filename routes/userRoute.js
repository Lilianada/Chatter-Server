const { userLogin, userSignup, profileUpdate } = require("../controllers/userControllers");
const express = require("express");
const router = express.Router();

router.post("/register", userSignup);

router.post("/login", userLogin);

router.post("/updateProfile", profileUpdate)

module.exports = router;
