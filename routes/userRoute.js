const { userLogin, userSignup, profileUpdate, userLogout, getSingleUser } = require("../controllers/userControllers");
const express = require("express");
const router = express.Router();

router.post("/register", userSignup);

router.post("/login", userLogin);

router.patch("/updateProfile/:userId", profileUpdate)

router.get("/getUser/:userId", getSingleUser)

router.post("/forgotPassword", (req, res) => {
  res.send("Forgot password route");
});

router.post("/resetPassword", (req, res) => {
  res.send("Reset password route");
});

router.get("/logout", userLogout);

module.exports = router;
