const { makeRequest } = require('../utils/requestHandler');
const { getHeaders, getRandomDelay, getRandomFingerprint } = require('../config/instagram');

class RequestManager {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.requestQueue = [];
        this.processing = false;
        this.MAX_CONCURRENT_REQUESTS = 2;
        this.MIN_DELAY = 2000;
        this.MAX_DELAY = 5000;
        this.RETRY_ATTEMPTS = 3;
        this.RETRY_DELAY = 3000;
        this.ERROR_COOLDOWN = 60000; // 1 minute
        this.lastErrorTime = 0;
        this.errorCount = 0;
        this.MAX_ERRORS = 5;
        this.RESET_INTERVAL = 3600000; // 1 hour
        this.requestHistory = [];
        this.MAX_HISTORY = 1000;
        this.suspiciousPatterns = new Set();
        this.blockedIPs = new Set();
        this.proxyRotation = [];
        this.currentProxyIndex = 0;

        // Initialize proxy rotation
        this.proxyRotation = [
            // Add your proxy list here
            // Format: { host: 'proxy1.example.com', port: 8080, auth: { username: 'user', password: 'pass' } }
        ];

        // Reset error count periodically
        setInterval(() => {
            this.errorCount = 0;
        }, this.RESET_INTERVAL);
    }

    getNextProxy() {
        if (this.proxyRotation.length === 0) return null;
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyRotation.length;
        return this.proxyRotation[this.currentProxyIndex];
    }

    isRateLimited(error) {
        return error.response?.status === 429 || 
               error.response?.status === 403 || 
               error.response?.data?.message?.includes('rate limit') ||
               error.response?.data?.message?.includes('too many requests');
    }

    isBlocked(error) {
        return error.response?.status === 403 || 
               error.response?.data?.message?.includes('blocked') ||
               error.response?.data?.message?.includes('suspicious activity');
    }

    detectSuspiciousPattern(request) {
        const patterns = [
            request.headers['user-agent']?.toLowerCase().includes('bot'),
            request.headers['user-agent']?.toLowerCase().includes('crawler'),
            request.headers['user-agent']?.toLowerCase().includes('spider'),
            request.headers['user-agent']?.toLowerCase().includes('scraper')
        ];
        
        return patterns.filter(Boolean).length >= 2;
    }

    shouldThrottle() {
        const now = Date.now();
        const recentRequests = this.requestHistory.filter(
            req => now - req.timestamp < 60000
        );
        
        return recentRequests.length > 30; // More than 30 requests per minute
    }

    async processQueue() {
        if (this.processing || this.requestQueue.length === 0) return;
        
        this.processing = true;
        
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            
            try {
                if (this.shouldThrottle()) {
                    await new Promise(resolve => setTimeout(resolve, this.MAX_DELAY));
                }
                
                const result = await this.executeRequest(request);
                request.resolve(result);
            } catch (error) {
                request.reject(error);
            }
            
            await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
        }
        
        this.processing = false;
    }

    async executeRequest(request) {
        const fingerprint = getRandomFingerprint();
        const headers = getHeaders();
        const proxy = this.getNextProxy();
        
        const options = {
            headers,
            proxy,
            timeout: 10000,
            maxRedirects: 5,
            validateStatus: status => status < 500
        };
        
        if (this.detectSuspiciousPattern(options)) {
            console.warn('Suspicious request pattern detected, retrying with new fingerprint');
            return this.executeRequest({
                ...request,
                options: {
                    ...options,
                    headers: getHeaders()
                }
            });
        }
        
        const response = await makeRequest(request.url, options);
        
        this.requestHistory.push({
            timestamp: Date.now(),
            url: request.url,
            status: response.status
        });
        
        if (this.requestHistory.length > this.MAX_HISTORY) {
            this.requestHistory.shift();
        }
        
        return response;
    }

    async makeRequestWithRetry(url, options, retries = this.RETRY_ATTEMPTS) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                url,
                options,
                resolve,
                reject,
                retries
            });
            
            this.processQueue();
        });
    }

    getCachedData(username) {
        const now = Date.now();
        const cachedData = this.cache.get(username);
        if (cachedData && now - cachedData.timestamp < this.CACHE_DURATION) {
            return cachedData.data;
        }
        return null;
    }

    setCachedData(username, data) {
        this.cache.set(username, {
            data,
            timestamp: Date.now()
        });
    }

    updateErrorTracking() {
        const now = Date.now();
        this.errorCount++;
        this.lastErrorTime = now;
        
        if (this.errorCount >= this.MAX_ERRORS) {
            this.errorCount = 0;
            this.lastErrorTime = now + this.ERROR_COOLDOWN;
        }
    }

    isInCooldown() {
        return Date.now() - this.lastErrorTime < this.ERROR_COOLDOWN;
    }
}

module.exports = new RequestManager(); 