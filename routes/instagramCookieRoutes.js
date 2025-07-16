const express = require('express');
const router = express.Router();
const instagramCookieService = require('../services/instagramCookieService');

// Add a new cookie
router.post('/', async (req, res) => {
    try {
        const cookie = await instagramCookieService.addCookie(req.body);
        res.status(201).json(cookie);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add multiple cookies
router.post('/bulk', async (req, res) => {
    try {
        const cookies = await instagramCookieService.addMultipleCookies(req.body);
        res.status(201).json(cookies);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all cookies
router.get('/', async (req, res) => {
    try {
        const cookies = await instagramCookieService.getAllCookies();
        res.json(cookies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active cookies
router.get('/active', async (req, res) => {
    try {
        const cookies = await instagramCookieService.getActiveCookies();
        res.json(cookies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get cookies by username
router.get('/username/:username', async (req, res) => {
    try {
        const cookies = await instagramCookieService.getCookiesByUsername(req.params.username);
        res.json(cookies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a random active cookie
router.get('/random', async (req, res) => {
    try {
        const cookie = await instagramCookieService.getRandomCookie();
        if (!cookie) {
            return res.status(404).json({ error: 'No active cookies found' });
        }
        res.json(cookie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get cookie by ID
router.get('/:id', async (req, res) => {
    try {
        const cookie = await instagramCookieService.getCookieById(req.params.id);
        if (!cookie) {
            return res.status(404).json({ error: 'Cookie not found' });
        }
        res.json(cookie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update cookie
router.put('/:id', async (req, res) => {
    try {
        const cookie = await instagramCookieService.updateCookie(req.params.id, req.body);
        if (!cookie) {
            return res.status(404).json({ error: 'Cookie not found' });
        }
        res.json(cookie);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete cookie
router.delete('/:id', async (req, res) => {
    try {
        const cookie = await instagramCookieService.deleteCookie(req.params.id);
        if (!cookie) {
            return res.status(404).json({ error: 'Cookie not found' });
        }
        res.json({ message: 'Cookie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deactivate expired cookies
router.post('/deactivate-expired', async (req, res) => {
    try {
        const result = await instagramCookieService.deactivateExpiredCookies();
        res.json({ 
            message: 'Expired cookies deactivated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 