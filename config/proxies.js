const proxyService = require('../services/proxyService');

let currentProxy = null;

async function getNextProxy() {
    try {
        const result = await proxyService.getFormattedProxy();
        if (!result || !result.proxyString) {
            console.error('No valid proxy string returned from proxy service');
            return null;
        }
        currentProxy = result.proxyString;
        return currentProxy;
    } catch (error) {
        console.error('Error getting proxy:', error.message);
        return null;
    }
}

// Initialize proxy on startup
async function initializeProxy() {
    try {
        const result = await proxyService.getFormattedProxy();
        if (result && result.proxyString) {
            currentProxy = result.proxyString;
            console.log('Proxy initialized successfully');
        } else {
            console.error('Failed to initialize proxy - no valid proxy string returned');
        }
    } catch (error) {
        console.error('Error initializing proxy:', error.message);
    }
}

// Call initialize on module load
initializeProxy();

module.exports = {
    getNextProxy
}; 