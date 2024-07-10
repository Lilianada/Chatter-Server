const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/userModels.js");
const TokenService = require("../services/tokenService");
const { signInWithEmailAndPassword, setPersistence, browserSessionPersistence } = require("firebase/auth");
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
    await db.collection('mail').add({
      to: email,
      message: `Dear gentle reader, welcome to Chatter! We are excited to have you on board. Enjoy your stay!`,
      subject: `Welcome to Chatter,  ${fullName}!`
    });
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
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    console.log("Verified UID:", uid);

    // Verify password (assuming you store a hash in your MongoDB and use bcrypt to compare)
    const user = await User.findOne({ userId: uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Create a custom token for session management
    // const customToken = await admin.auth().createCustomToken(uid);

    // Return the successful login response with the token
    res.status(200).json({
      success: true,
      message: "Authentication successful.",
      user: {
        uid: uid,
        email: user.email,
        fullName: user.fullName,
        categories: user.categories,
        profilePic: user.profilePic,
        username: user.username
      },
      // token: customToken,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed.", error: error.message });
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
  const { userId } = req.params;
  const {
    fullName,
    userName,
    email,
    description,
    profilePic,
    pronouns,
    categories
  } = req.body;

  try {
    const user = await User.findOneAndUpdate(userId);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }

    // Update user fields if provided
    user.fullName = fullName || user.fullName;
    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;
    user.description = description || user.description;
    user.pronouns = pronouns || user.pronouns;
    user.categories = categories || user.categories;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: `User updated successfully`,
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

exports.userLogout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];  // Extract the token from the header
  try {
    // Invalidate the token by removing it from active sessions or marking it as invalid
    await invalidateToken(token);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging out", error: error.message });
  }
});
