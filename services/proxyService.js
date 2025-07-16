const Proxy = require('../models/Proxy');

class ProxyService {
    // Add a new proxy
    async addProxy(proxyData) {
        try {
            const proxy = new Proxy(proxyData);
            return await proxy.save();
        } catch (error) {
            throw new Error(`Error adding proxy: ${error.message}`);
        }
    }

    // Add multiple proxies
    async addMultipleProxies(proxiesData) {
        try {
            return await Proxy.insertMany(proxiesData);
        } catch (error) {
            throw new Error(`Error adding multiple proxies: ${error.message}`);
        }
    }

    // Get all proxies
    async getAllProxies() {
        try {
            return await Proxy.find();
        } catch (error) {
            throw new Error(`Error fetching proxies: ${error.message}`);
        }
    }

    // Get active proxies
    async getActiveProxies() {
        try {
            return await Proxy.find({ isActive: true });
        } catch (error) {
            throw new Error(`Error fetching active proxies: ${error.message}`);
        }
    }

    // Get a proxy by ID
    async getProxyById(id) {
        try {
            return await Proxy.findById(id);
        } catch (error) {
            throw new Error(`Error fetching proxy: ${error.message}`);
        }
    }

    // Update a proxy
    async updateProxy(id, updateData) {
        try {
            return await Proxy.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: Date.now() },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating proxy: ${error.message}`);
        }
    }

    // Delete a proxy
    async deleteProxy(id) {
        try {
            return await Proxy.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting proxy: ${error.message}`);
        }
    }

    // Get a random active proxy
    async getRandomProxy() {
        try {
            const count = await Proxy.countDocuments({ isActive: true });
            const random = Math.floor(Math.random() * count);
            const proxy = await Proxy.findOne({ isActive: true }).skip(random);
            
            if (proxy) {
                proxy.lastUsed = Date.now();
                await proxy.save();
            }
            
            return proxy;
        } catch (error) {
            throw new Error(`Error getting random proxy: ${error.message}`);
        }
    }

    // Get a proxy in the format needed for the application
    async getFormattedProxy() {
        try {
            const proxy = await this.getRandomProxy();
            if (!proxy) {
                console.error('No active proxies available');
                return null;
            }

            // Validate proxy fields
            if (!proxy.host || !proxy.port) {
                console.error('Invalid proxy configuration - missing host or port');
                return null;
            }

            // Format the proxy string based on authentication
            let proxyString;
            if (proxy.username && proxy.password) {
                proxyString = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
            } else {
                proxyString = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
            }
            
            return {
                proxyString,
                proxy
            };
        } catch (error) {
            console.error(`Error getting formatted proxy: ${error.message}`);
            return null;
        }
    }
}

module.exports = new ProxyService(); 