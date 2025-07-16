const mongoose = require('mongoose');

const instagramCookieSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    cookies: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
instagramCookieSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add index for faster queries
instagramCookieSchema.index({ username: 1, isActive: 1 });
instagramCookieSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const InstagramCookie = mongoose.model('InstagramCookie', instagramCookieSchema);

module.exports = InstagramCookie; 