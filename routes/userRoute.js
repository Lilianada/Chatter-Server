const { userLogin, userSignup, profileUpdate, userLogout, getSingleUser, uploadImage } = require("../controllers/userControllers");
const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadConfig")

router.post("/register", userSignup);

router.post("/login", userLogin);

// router.patch("/updateProfile", upload.single("profilePic"), profileUpdate);
router.patch("/updateProfile", profileUpdate);

router.post("/uploadImage", uploadImage)

router.get("/getUser", getSingleUser)

router.post("/forgotPassword", (req, res) => {
  res.send("Forgot password route");
});

router.post("/resetPassword", (req, res) => {
  res.send("Reset password route");
});

router.get("/logout", userLogout);

module.exports = router;
