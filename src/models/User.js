const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    surname: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20
    },
    borrowedBooks: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        borrowedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);