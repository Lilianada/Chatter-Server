const mongoose = require("mongoose");

const articleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add title of the article"],
    },
    description: {
      type: String,
      required: [true, "Please add subtitle of article"],
    },
    content: {
      type: String,
      required: [true, "Please add the content of the article"],
    },
    coverImage: {
      type: String,
    },
    categories: [{ type: String }],
    author: {
      name: String,
      email: String,
      image: String,
      href: String,
      userId: String
    },
    date: {
        type: String,
    },
    status: { type: String, default: 'published' },
    favourite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Articles", articleSchema);
