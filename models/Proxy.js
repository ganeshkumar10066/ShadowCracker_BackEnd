const mongoose = require('mongoose');

const proxySchema = new mongoose.Schema({
    host: {
        type: String,
        required: true,
        trim: true
    },
    port: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    protocol: {
        type: String,
        enum: ['http', 'https', 'socks4', 'socks5'],
        default: 'http'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
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
proxySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Proxy = mongoose.model('Proxy', proxySchema);

module.exports = Proxy; 