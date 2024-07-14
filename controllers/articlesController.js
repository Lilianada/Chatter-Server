const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse.js");
const Articles = require("../models/articlesModels.js");
const uploadImage = require("../helpers/uploadHelper.js");

exports.getAllArticles = asyncHandler(async (req, res, next) => {
  
  try {

    const articles = await Articles.find();
    if (!articles) {
      return res.status(404).json({ message: `No articles found` });
    }

    res.status(200).json({
      success: true,
      message: "All articles fetched successfully",
      data: articles});
  } catch (err) {
    console.error("Error in fetching articles:", err);
    next(new ErrorResponse("Error in fetching articles", 500));
  }
});

exports.getSingleArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const article = await Articles.findById(id);
    if (!article) {
      return res.status(404).json({ message: `Article not found for id ${id}` });
    }
  
    res.status(200).json({
      success: true,
      message: `Article found for id ${id}`,
      data: article,
    });
  } catch (err) {
    console.error("Error in fetching article:", err);
    next(new ErrorResponse("Error in fetching article", 500));
  }
});

exports.getUserArticles = asyncHandler(async (req, res, next) => {g
  const userId = req.params.userId;

  try {
    const articles = await Articles.find({ userId: userId });

    // Check if any articles were found
    if (articles.length === 0) {
      return res.status(404).json({ message: "No articles found for this user" });
    }

    res.status(200).json({
      success: true,
      message: "Articles fetched successfully",
      data: articles
    });
  } catch (err) {
    console.error("Error in fetching articles:", err);
    next(new ErrorResponse("Error in fetching articles", 500));
  }
});


exports.createArticle = asyncHandler(async (req, res, next) => {
  console.log('Request body:', req.body);
  const { title, description, date, categories, author, content, coverImage, favourite = false } = req.body;

  try {

    const article = new Articles({
      title,
      description,
      content,
      coverImage,
      date,
      categories,
      author,
      favourite,
    });

    console.log(article)

    const createdArticle = await article.save();
    res.status(201).json({
      success: true,
      data: createdArticle,
    });
  } catch (err) {
    console.error("Error in creating article:", err);
    let statusCode = 500;
    let message = 'Error in creating article';
    
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    }
    
    next(new ErrorResponse(message, statusCode));
  }
});

exports.saveDraft = asyncHandler(async (req, res, next) => {
  const { title, content, author } = req.body;

  if (!title && !content) {
      return res.status(400).json({
          success: false,
          message: 'A draft must have at least a title or content.'
      });
  }

  try {
      const draft = new Articles({
          title,
          content,
          author,
          status: 'draft'  // Assuming there's a status field to differentiate articles and drafts
      });

      const savedDraft = await draft.save();
      res.status(201).json({
          success: true,
          data: savedDraft
      });
  } catch (err) {
      console.error("Error saving draft:", err);
      const statusCode = err.name === 'ValidationError' ? 400 : 500;
      next(new ErrorResponse(err.message || 'Error in saving draft', statusCode));
  }
});


exports.updateArticle = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  try {
    const article = await Articles.findByIdA(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({ success: false, message: `Article not found for id ${id}` });
    }

    
    res.status(200).json({
      success: true,
       message: `PUT update article for ${id}`,
      data: article
     });
  } catch (err) {
    console.error("Error in updating article:", err);
    next(new ErrorResponse("Error in updating article", 500));
  }
});

exports.deleteArticle = asyncHandler(async (req, res) => {
  res.status(200).json({ message: `DELETE article for ${req.params.id}` });
});
