const profileService = require('./profileService');
const requestManager = require('./requestManager');
const User = require('../models/User');

class PricingService {
    constructor() {
        this.STORAGE_DURATION = 30 * 60 * 1000; // 30 minutes
    }

    async getStoredData(username) {
        try {
            const user = await User.findOne({ username });
            if (user && user.searchData && user.searchData.pricingData) {
                console.log(`[Pricing] Found stored pricing data for ${username}`);
                // Ensure the returned object has a 'success' property
                return {
                    success: true,
                    data: user.searchData.profileData,
                    pricingData: user.searchData.pricingData
                };
            }
            console.log(`[Pricing] No stored pricing data found for ${username}`);
            return null;
        } catch (error) {
            console.error('[Pricing] Error getting stored data:', error);
            return null;
        }
    }

    async storeData(username, data) {
        try {
            let user = await User.findOne({ username });
            const pricingData = this.calculateAccountValue(data);
            
            const combinedData = {
                profileData: data,
                pricingData: pricingData,
                lastUpdated: new Date()
            };

            if (!user) {
                user = new User({
                    username,
                    email: `${username}@example.com`,
                    password: 'temp',
                    searchData: combinedData
                });
            } else {
                user.searchData = combinedData;
            }
            await user.save();
            console.log(`[Pricing] Stored profile and pricing data for ${username}`);
            return pricingData;
        } catch (error) {
            console.error('[Pricing] Error storing data:', error);
            throw error;
        }
    }

    calculateEngagementRate(userData) {
        const followers = userData.edge_followed_by?.count || 0;
        const following = userData.edge_follow?.count || 0;
        const posts = userData.edge_owner_to_timeline_media?.count || 0;
        
        if (followers === 0 || posts === 0) return 0;
        
        // Calculate engagement rate based on followers and posts
        const engagementRate = (following / followers) * 100;
        return Math.min(engagementRate, 100); // Cap at 100%
    }

    calculateAccountValue(userData) {
        console.log(`[Pricing] Calculating price for ${userData.username}`);
        console.log(`[Pricing] Followers: ${userData.edge_followed_by?.count || 0}`);
        
        const followers = userData.edge_followed_by?.count || 0;
        const isVerified = userData.is_verified || false;
        const isBusiness = userData.is_business_account || false;
        const isProfessional = userData.is_professional_account || false;
        const engagementRate = this.calculateEngagementRate(userData);
        const hasHighlights = (userData.highlight_reel_count || 0) > 0;

        // Base price calculation based on followers
        let basePrice;
        if (followers >= 1000000) { // 1M+ followers
            basePrice = 10000;
        } else if (followers >= 500000) { // 500K+ followers
            basePrice = 8000;
        } else if (followers >= 100000) { // 100K+ followers
            basePrice = 6000;
        } else if (followers >= 50000) { // 50K+ followers
            basePrice = 4000;
        } else if (followers >= 10000) { // 10K+ followers
            basePrice = 2000;
        } else if (followers >= 5000) { // 5K+ followers
            basePrice = 1000;
        } else if (followers >= 2000) { // 2K+ followers
            basePrice = 500;
        } else { // Below 2K followers
            basePrice = 100;
        }

        console.log(`[Pricing] Base price: ${basePrice}`);

        // Apply multipliers
        let finalMultiplier = 1;
        
        // Verification multiplier
        if (isVerified) {
            finalMultiplier *= 1.5;
            console.log('[Pricing] Applied verified account multiplier: 1.5x');
        }
        
        // Business account multiplier
        if (isBusiness) {
            finalMultiplier *= 1.2;
            console.log('[Pricing] Applied business account multiplier: 1.2x');
        }
        
        // Professional account multiplier
        if (isProfessional) {
            finalMultiplier *= 1.1;
            console.log('[Pricing] Applied professional account multiplier: 1.1x');
        }
        
        // Engagement rate multiplier (0.8 to 1.2 based on engagement)
        const engagementMultiplier = (0.8 + (engagementRate / 100) * 0.4);
        finalMultiplier *= engagementMultiplier;
        console.log(`[Pricing] Applied engagement rate multiplier: ${engagementMultiplier.toFixed(2)}x`);
        
        // Highlights multiplier
        if (hasHighlights) {
            finalMultiplier *= 1.05;
            console.log('[Pricing] Applied highlights multiplier: 1.05x');
        }

        // Calculate final price
        let finalPrice = Math.round(basePrice * finalMultiplier);
        
        // Ensure minimum price of 120 if less than 100
        if (finalPrice < 100) {
            finalPrice = 120;
            console.log('[Pricing] Applied minimum price of 120');
        }
        
        console.log(`[Pricing] Final price: ${finalPrice} (${finalMultiplier.toFixed(2)}x total multiplier)`);

        return {
            basePrice,
            finalPrice: finalPrice.toString(),
            multipliers: {
                isVerified,
                isBusiness,
                isProfessional,
                engagementRate: engagementRate.toFixed(2),
                hasHighlights
            }
        };
    }

    async getAccountPrice(username) {
        try {
            console.log(`[Pricing] Getting price for ${username}`);
            
            // Check stored data in MongoDB
            const storedData = await this.getStoredData(username);
            if (storedData && storedData.pricingData) {
                console.log(`[Pricing] Using stored pricing data for ${username}`);
                return storedData.pricingData;
            }

            // If no stored data, get fresh profile data
            console.log(`[Pricing] Fetching fresh profile data for ${username}`);
            const profileData = await profileService.getProfileData(username);
            if (!profileData.success) {
                throw new Error('Failed to fetch profile data');
            }

            // Calculate price and store in MongoDB
            const priceData = await this.storeData(username, profileData.data);
            return priceData;
        } catch (error) {
            console.error('[Pricing] Error calculating account price:', error);
            throw error;
        }
    }
}

module.exports = new PricingService(); 