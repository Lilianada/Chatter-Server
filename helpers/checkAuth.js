const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json(new ErrorResponse("Token Absent", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("DECODED>>>>", decoded);
    next();
  } catch (err) {
    // Specifically check for token expiration error
    if (err instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json(new ErrorResponse("Session expired. Please log in again.", 401));
    } else if (err instanceof jwt.JsonWebTokenError) {
      // Covers other JWT errors like malformed token
      return res
        .status(401)
        .json(new ErrorResponse("Invalid token. Please log in again.", 401));
    }
    // For other types of errors
    return res
      .status(400)
      .json(new ErrorResponse("An error occurred during authentication", 400));
  }
};
