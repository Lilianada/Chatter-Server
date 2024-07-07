const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const connectDb = require("./config/db.js");
const fileupload = require("express-fileupload");
const path = require("path");
const multer = require('multer');

const PORT = process.env.PORT || 5050;
connectDb();

const app = express();
const user = require("./routes/userRoute.js");
const articles = require("./routes/articlesRoutes.js");
const categories = require("./routes/categoryRoutes.js");
const errorHandler = require("./middleware/error.js");

// Apply CORS
app.use(cors());

// Set up body parser limits before any routes that will parse incoming JSON or URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));

// File uploading middleware
app.use(fileupload({
  limits: { fileSize: 50 * 1024 * 1024 }, // Optional: if you want to configure file upload size here as well
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Mount routers
app.use("/api/user", user);
app.use("/api/article", articles);
app.use("/api/category", categories);

// After all routes
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Error handling middleware should be the last piece of middleware added
app.use(errorHandler);
