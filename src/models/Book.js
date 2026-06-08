const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    author: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    year: {
        type: Number,
        required: true,
        min: 1000,
        max: new Date().getFullYear()
    },
    available: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);