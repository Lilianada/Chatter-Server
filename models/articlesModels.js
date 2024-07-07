const mongoose = require("mongoose");

const articleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add title of the article"],
    },
    subtitle: {
      type: String,
      required: [true, "Please add subtitle of article"],
    },
    content: {
      type: String,
      required: [true, "Please add the content of the article"],
    },
    image: {
      type: String,
    },
    category: {
      type: Array,
      required: [true, "Please Add Category"],
    },
    author: {
      name: String,
      role: String,
      href: String,
      imageUrl: String,
    },
    date: {
        type: String,
    },
    favourite: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Articles", articleSchema);
