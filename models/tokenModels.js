// models/Token.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expireAt: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        required: true,
        default: false
    },
    purpose: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

tokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });


module.exports = mongoose.model('Token', tokenSchema);;
