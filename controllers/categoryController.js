const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse.js");
const uploadImage = require("../helpers/uploadHelper.js");
const Category = require("../models/categoryModels.js");
const User = require("../models/userModels.js");

exports.getAllCategories = asyncHandler(async (req, res, next) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res.status(404).json({ message: `No categories found` });
    }
    res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      categories,
    });
  } catch (err) {
    console.error("Error in fetching categories:", err);
    next(new ErrorResponse("Error in fetching categories", 500));
  }
});

exports.getSingleCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ message: `Category not found for id ${id}` });
    }

    res.status(200).json({
      success: true,
      message: `Category found for id ${id}`,
      data: category,
    });
  } catch (err) {
    console.error("Error in fetching category:", err);
    next(new ErrorResponse("Error in fetching category", 500));
  }
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  console.log("Request body:", req.body);
  const { name, current, index } = req.body;

  try {
    const category = new Category({
      name,
      current,
      index,
    });

    const newCategory = await category.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (err) {
    console.error("Error in creating category:", err);
    next(new ErrorResponse("Error in creating category", 500));
  }
});

exports.addCategoryToUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { categories } = req.body; // Assuming this could be an array of categories

  console.log("User Id:", id, "Categories:", categories);
  // Check if 'categories' is provided and is an array
  if (!categories || !Array.isArray(categories)) {
    return res
      .status(400)
      .json({ message: "Invalid categories provided, must be an array." });
  }

  console.log("Request body:", req.body, "Request params:", req.params);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const user = await User.findById(id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }
    // Add categories to the user's categories array if not already included
    categories.forEach((category) => {
      if (!user.categories.includes(category)) {
        user.categories.push(category);
      }
    });

    await user.save();
    res.status(200).json({
      success: true,
      message: `Categories added to user id ${id}`,
      data: user,
    });
  } catch (err) {
    console.error("Error in adding category to user:", err);
    next(new ErrorResponse("Error in adding category to user", 500));
  }
});

exports.getUserCategories = asyncHandler(async (req, res, next) => {
  const { userId } = req.params; // userID of the user from whom to fetch categories
  console.log(userId);
  // Validate the userID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userID." });
  }

  try {
    const user = await User.findById(userId).select("categories");
    if (!user) {
      return res
        .status(404)
        .json({ message: `User not found for userID ${userId}` });
    }

    res.status(200).json({
      success: true,
      message: `Categories retrieved successfully for userID ${userId}`,
      categories: user.categories, // Return the categories array
    });
  } catch (err) {
    console.error("Error in fetching user categories:", err);
    next(new ErrorResponse("Error in fetching user categories", 500));
  }
});
