const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');
const requestManager = require('../services/requestManager');
const searchDataService = require('../services/searchDataService');

router.get('/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const profileData = await profileService.getProfileData(username);
        
        // Store search data in background
        searchDataService.storeSearchData(username, profileData.data)
            .catch(error => console.error('Error storing search data:', error));

        res.json(profileData);
    } catch (error) {
        console.error('Error in profile route:', error);
        
        const errorResponse = {
            success: false,
            message: error.message
        };

        if (error.message === 'Rate limit cooldown in effect' || requestManager.isRateLimited(error)) {
            return res.status(429).json({
                ...errorResponse,
                message: 'Rate limited. Please try again later.'
            });
        }

        if (requestManager.isBlocked(error)) {
            return res.status(403).json({
                ...errorResponse,
                message: 'Access blocked. Please try again later.'
            });
        }

        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(503).json({
                ...errorResponse,
                message: 'Instagram service temporarily unavailable'
            });
        }

        if (error.message === 'Profile not found') {
            return res.status(404).json({
                ...errorResponse,
                message: 'Profile not found'
            });
        }

        res.status(error.response?.status || 500).json({
            ...errorResponse,
            status: error.response?.status || 'unknown'
        });
    }
});

module.exports = router; 