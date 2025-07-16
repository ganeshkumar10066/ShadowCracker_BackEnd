const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { getNextProxy } = require('../config/proxies');
const { getHeaders, getRandomDelay, getRandomFingerprint } = require('../config/instagram');

async function makeRequest(url, options = {}) {
  const maxRetries = 5;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add random delay to mimic human behavior
      const delay = getRandomDelay();
      await new Promise(resolve => setTimeout(resolve, delay));

      // Rotate fingerprint and headers for each attempt
      const headers = options.headers || getHeaders();
      const proxy = await getNextProxy();

      if (!proxy) {
        console.log('No proxy available, making direct request...');
        const response = await axios({
          ...options,
          url,
          headers,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });
        return response;
      }

      try {
        const agent = new HttpsProxyAgent(proxy);
        const response = await axios({
          ...options,
          url,
          headers,
          httpsAgent: agent,
          proxy: false,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });

        if (response.status === 200) {
          return response;
        }

        if (response.status === 403 || response.status === 429) {
          console.log(`Proxy ${proxy} returned ${response.status}, rotating proxy/fingerprint and retrying...`);
          continue;
        }

        return response;
      } catch (proxyError) {
        console.error(`Error with proxy ${proxy}:`, proxyError.message);
        // If proxy fails, try direct request
        console.log('Attempting direct request after proxy failure...');
        const response = await axios({
          ...options,
          url,
          headers,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });
        return response;
      }
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      // Add exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw lastError;
}

module.exports = {
  makeRequest
}; 