const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/userModels.js");
const TokenService = require("../services/tokenService");
const { signInWithEmailAndPassword } = require("firebase/auth");
const admin = require("firebase-admin");
const { db } = require("../middleware/authenticate");
const bcrypt = require('bcrypt');

exports.userSignup = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  console.log("Request body:", req.body);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists"
      });
    }

    const userCredential = await admin.auth().createUser({
      email,
      password,
      displayName: fullName
    });
    console.log("New user ID:", userCredential.uid);

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({
      fullName,
      password: hash,
      email,
      userId: userCredential.uid,
    });
    await newUser.save();
    console.log("User registered and saved to MongoDB and Setting document in Firebase Firestore");
    const result = await db.collection("users").doc(userCredential.uid).set({
      fullName, email, userId: userCredential.uid
    });
    console.log("Result of setting document:", result);

    res.status(201).send({
      message: "User registered successfully",
      data: newUser,
      success: true,
    });
  } catch (error) {
    console.error("Error in user registration process:", error.message);
    res.status(500).send(`Error registering user: ${error.message}`);
  }
});

exports.userLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    // Firebase login logic should be here
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    res.status(200).send({
      message: `User ${user.email} logged in`,
      user: user,
      success: true,
    });
  } catch (error) {
    res.status(500).send("Error logging in user");
  }
});

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await Users.find();
    if (!users) {
      return res.status(404).json({ message: `No users found` });
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error in fetching users:", err);
    next(new ErrorResponse("Error in fetching users", 500));
  }
});

exports.getSingleUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }

    res.status(200).json({
      success: true,
      message: `User found for id ${id}`,
      data: user,
    });
  } catch (err) {
    console.error("Error in fetching user:", err);
    next(new ErrorResponse("Error in fetching user", 500));
  }
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }

    await user.remove();
    res.status(200).json({
      success: true,
      message: `User deleted for id ${id}`,
    });
  } catch (err) {
    console.error("Error in deleting user:", err);
    next(new ErrorResponse("Error in deleting user", 500));
  }
});

exports.profileUpdate = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    userName,
    email,
    profilePic,
    phoneNumber,
    country,
    lang,
    password,
    role,
  } = req.body;

  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }

    // Update user fields if provided
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.country = country || user.country;
    user.lang = lang || user.lang;
    user.password = password || user.password; // Consider hashing the password if it's new
    user.role = role || user.role;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: `User updated successfully for id ${id}`,
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error in updating user:", err);
    next(new ErrorResponse("Error in updating user", 500));
  }
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email." });
    }

    // Generate a reset token using the Token Service
    const resetToken = await TokenService.generateToken("resetPassword");

    // Create reset URL to email to the provided email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${resetToken.token}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });

      res.status(200).json({ success: true, message: "Email sent" });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Users.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log the user in
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});
