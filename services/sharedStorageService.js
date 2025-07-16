const User = require('../models/User');

class SharedStorageService {
    constructor() {
        this.storage = new Map();
    }

    async getData(username) {
        try {
            const user = await User.findOne({ username });
            return user ? user.searchData : null;
        } catch (error) {
            console.error('Error getting data from shared storage:', error);
            return null;
        }
    }

    async setData(username, data) {
        try {
            let user = await User.findOne({ username });
            if (!user) {
                user = new User({
                    username,
                    email: `${username}@example.com`,
                    password: 'temp',
                    searchData: data
                });
            } else {
                user.searchData = data;
            }
            await user.save();
            return true;
        } catch (error) {
            console.error('Error setting data in shared storage:', error);
            return false;
        }
    }

    async clearData(username) {
        try {
            const user = await User.findOne({ username });
            if (user) {
                user.searchData = null;
                await user.save();
            }
            return true;
        } catch (error) {
            console.error('Error clearing data from shared storage:', error);
            return false;
        }
    }
}

module.exports = new SharedStorageService(); 