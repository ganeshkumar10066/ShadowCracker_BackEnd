const express = require('express');
const router = express.Router();
const PasswordService = require('../services/passwordService');

router.post('/generate', (req, res) => {
    try {
        const { username, fullName, bio } = req.body;
        
        if (!username || !fullName) {
            return res.status(400).json({ 
                error: 'Username and full name are required' 
            });
        }
        
        const password = PasswordService.generatePassword({
            username,
            fullName,
            bio: bio || ''
        });
        
        res.json({ password });
    } catch (error) {
        console.error('Password generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate password' 
        });
    }
});

module.exports = router; 