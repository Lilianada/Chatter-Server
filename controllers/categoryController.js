const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse.js");
const uploadImage = require("../helpers/uploadHelper.js");
const Category = require("../models/categoryModels.js");

exports.getAllCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await Category.find();
        if (!categories) {
        return res.status(404).json({ message: `No categories found` });
        }
    
        res.status(200).json({
        success: true,
        message: "All categories fetched successfully",
        data: categories,
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
        return res.status(404).json({ message: `Category not found for id ${id}` });
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
    console.log('Request body:', req.body);
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

//add category to user db
exports.addCategoryToUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { category } = req.body;
    try {
        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: `User not found for id ${id}` });
        }
        user.categories.push(category);
        await user.save();
        res.status(200).json({
            success: true,
            message: `Category added to user id ${id}`,
            data: user,
        });
    } catch (err) {
        console.error("Error in adding category to user:", err);
        next(new ErrorResponse("Error in adding category to user", 500));
    }
});