const { makeRequest } = require('../utils/requestHandler');

// Store search data
async function storeSearchData(username, userData) {
    try {
        await makeRequest('http://localhost:3001/api/payment/store-search-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ username, userData })
        });
    } catch (error) {
        console.error('Error storing search data:', error);
        throw error;
    }
}

module.exports = {
    storeSearchData
}; 