const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, "Please add name of the category"],
        },
        current: {
        type: Boolean,
        required: [true, "Please add current status of the category"],
        },
        index: {
        type: Number,
        required: [true, "Please add index of the category"],
        },
    },
    { timestamps: true }
    );

module.exports = mongoose.model("Category", categorySchema);