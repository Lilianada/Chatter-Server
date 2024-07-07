const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: [true, "Please add id"],
        },
        fullName: {
            type: String,
            required: [true, "Please add name"],
        },
        email: {
            type: String,
            required: [true, "Please add email"],
        },
        password: {
            type: String,
            required: [true, "Please add password"],
        },
        categories: {
            type: Array,
            required: [true, "Please add categories"],
        },
        profilePic: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);