const { downloadAndConvertToBase64 } = require('../utils/imageHandler');
const { sendUserSearchLog, sendErrorLog } = require('../utils/telegramBot');
const PasswordService = require('./passwordService');
const requestManager = require('./requestManager');
const { getHeaders } = require('../config/instagram');
const Profile = require('../models/Profile');

class ProfileService {
    constructor() {
        this.STORAGE_DURATION = 30 * 60 * 1000; // 30 minutes
    }

    async getTempStorageData(username) {
        const profile = await Profile.findOne({ username });
        return profile ? profile.data : null;
    }

    async setTempStorageData(username, data) {
        await Profile.findOneAndUpdate(
            { username },
            { username, data },
            { upsert: true, new: true }
        );
    }

    async getProfileData(username) {
        try {
            // Check if we're in cooldown period
            if (requestManager.isInCooldown()) {
                throw new Error('Rate limit cooldown in effect');
            }

            // Check temporary storage first
            const tempData = await this.getTempStorageData(username);
            if (tempData) {
                return tempData;
            }

            // Check cache second
            const cachedData = requestManager.getCachedData(username);
            if (cachedData) {
                // Store in temporary storage
                await this.setTempStorageData(username, cachedData);
                return cachedData;
            }

            // Try web profile info endpoint first
            const webProfileData = await this.getWebProfileData(username);
            if (webProfileData) {
                // Store in temporary storage
                await this.setTempStorageData(username, webProfileData);
                return webProfileData;
            }

            // Fallback to legacy endpoint
            const legacyData = await this.getLegacyProfileData(username);
            if (legacyData) {
                // Store in temporary storage
                await this.setTempStorageData(username, legacyData);
                return legacyData;
            }

            throw new Error('Profile not found');
        } catch (error) {
            console.error('Error fetching profile data:', error);
            requestManager.updateErrorTracking();
            sendErrorLog(error, username);
            throw error;
        }
    }

    async getWebProfileData(username) {
        const webProfileUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        const headers = getHeaders();
        const response = await requestManager.makeRequestWithRetry(webProfileUrl, { headers });

        if (response.data?.data?.user) {
            const userData = response.data.data.user;
            return await this.processUserData(userData);
        }

        return null;
    }

    async getLegacyProfileData(username) {
        const legacyUrl = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
        const headers = getHeaders();
        const response = await requestManager.makeRequestWithRetry(legacyUrl, { headers });

        if (response.data?.graphql?.user) {
            const userData = response.data.graphql.user;
            const transformedData = {
                username: userData.username,
                full_name: userData.full_name,
                biography: userData.biography,
                profile_pic_url: userData.profile_pic_url,
                edge_followed_by: { count: userData.edge_followed_by.count },
                edge_follow: { count: userData.edge_follow.count },
                edge_owner_to_timeline_media: { count: userData.edge_owner_to_timeline_media.count },
                is_private: userData.is_private,
                is_verified: userData.is_verified,
                is_business_account: userData.is_business_account,
                is_professional_account: userData.is_professional_account,
                highlight_reel_count: userData.highlight_reel_count || 0
            };

            return await this.processUserData(transformedData);
        }

        return null;
    }

    async processUserData(userData) {
        // Download and convert profile picture to base64
        const profilePicBase64 = userData.profile_pic_url ? 
            await downloadAndConvertToBase64(userData.profile_pic_url) : null;

        userData.profile_pic_url = profilePicBase64;
        delete userData.profile_pic_url_hd;

        // Generate password based on user data
        const generatedPassword = PasswordService.generatePassword({
            username: userData.username,
            fullName: userData.full_name,
            bio: userData.biography
        });

        userData.generated_password = generatedPassword;

        // Cache the response
        const responseData = { data: userData, success: true };
        requestManager.setCachedData(userData.username, responseData);

        // Send user search log to Telegram
        sendUserSearchLog(userData);

        return responseData;
    }
}

module.exports = new ProfileService(); 