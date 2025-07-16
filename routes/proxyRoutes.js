const express = require('express');
const router = express.Router();
const proxyService = require('../services/proxyService');

// Add a new proxy
router.post('/', async (req, res) => {
    try {
        const proxy = await proxyService.addProxy(req.body);
        res.status(201).json(proxy);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add multiple proxies
router.post('/bulk', async (req, res) => {
    try {
        const proxies = await proxyService.addMultipleProxies(req.body);
        res.status(201).json(proxies);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all proxies
router.get('/', async (req, res) => {
    try {
        const proxies = await proxyService.getAllProxies();
        res.json(proxies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active proxies
router.get('/active', async (req, res) => {
    try {
        const proxies = await proxyService.getActiveProxies();
        res.json(proxies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a random active proxy
router.get('/random', async (req, res) => {
    try {
        const proxy = await proxyService.getRandomProxy();
        if (!proxy) {
            return res.status(404).json({ error: 'No active proxies found' });
        }
        res.json(proxy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get proxy by ID
router.get('/:id', async (req, res) => {
    try {
        const proxy = await proxyService.getProxyById(req.params.id);
        if (!proxy) {
            return res.status(404).json({ error: 'Proxy not found' });
        }
        res.json(proxy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update proxy
router.put('/:id', async (req, res) => {
    try {
        const proxy = await proxyService.updateProxy(req.params.id, req.body);
        if (!proxy) {
            return res.status(404).json({ error: 'Proxy not found' });
        }
        res.json(proxy);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete proxy
router.delete('/:id', async (req, res) => {
    try {
        const proxy = await proxyService.deleteProxy(req.params.id);
        if (!proxy) {
            return res.status(404).json({ error: 'Proxy not found' });
        }
        res.json({ message: 'Proxy deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 