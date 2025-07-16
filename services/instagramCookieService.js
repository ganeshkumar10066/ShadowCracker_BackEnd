const InstagramCookie = require('../models/InstagramCookie');

const MAX_RETRIES = 3;

async function withRetries(fn, ...args) {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
        try {
            return await fn(...args);
        } catch (error) {
            attempt++;
            if (attempt >= MAX_RETRIES) {
                // Only log sanitized error
                console.error('InstagramCookieService error:', error.message);
                throw new Error('Database operation failed after retries.');
            }
        }
    }
}

class InstagramCookieService {
    // Add a new cookie
    async addCookie(cookieData) {
        return withRetries(async () => {
            const cookie = new InstagramCookie(cookieData);
            return await cookie.save();
        });
    }

    // Add multiple cookies
    async addMultipleCookies(cookiesData) {
        return withRetries(async () => {
            return await InstagramCookie.insertMany(cookiesData);
        });
    }

    // Get all cookies
    async getAllCookies() {
        return withRetries(async () => {
            return await InstagramCookie.find();
        });
    }

    // Get active cookies
    async getActiveCookies() {
        return withRetries(async () => {
            return await InstagramCookie.find({ 
                isActive: true,
                expiresAt: { $gt: new Date() }
            });
        });
    }

    // Get cookies by username
    async getCookiesByUsername(username) {
        return withRetries(async () => {
            return await InstagramCookie.find({ 
                username,
                isActive: true,
                expiresAt: { $gt: new Date() }
            });
        });
    }

    // Get a cookie by ID
    async getCookieById(id) {
        return withRetries(async () => {
            return await InstagramCookie.findById(id);
        });
    }

    // Update a cookie
    async updateCookie(id, updateData) {
        return withRetries(async () => {
            return await InstagramCookie.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: Date.now() },
                { new: true }
            );
        });
    }

    // Delete a cookie
    async deleteCookie(id) {
        return withRetries(async () => {
            return await InstagramCookie.findByIdAndDelete(id);
        });
    }

    // Get a random active cookie
    async getRandomCookie() {
        return withRetries(async () => {
            const count = await InstagramCookie.countDocuments({ 
                isActive: true,
                expiresAt: { $gt: new Date() }
            });
            if (count === 0) return null;
            const random = Math.floor(Math.random() * count);
            const cookie = await InstagramCookie.findOne({ 
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).skip(random);
            if (cookie) {
                cookie.lastUsed = Date.now();
                await cookie.save();
            }
            return cookie;
        });
    }

    // Deactivate expired cookies
    async deactivateExpiredCookies() {
        return withRetries(async () => {
            return await InstagramCookie.updateMany(
                { 
                    expiresAt: { $lt: new Date() },
                    isActive: true
                },
                { 
                    $set: { isActive: false }
                }
            );
        });
    }
}

module.exports = new InstagramCookieService(); 