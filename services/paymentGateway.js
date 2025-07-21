const axios = require('axios');
const md5 = require('md5');

// Constants
const MERCHANT_ID = '85071336';
const PRIVATE_KEY = 'f7b3eb7e62f0c439763048c403ee158a';
const BASE_URL = 'https://xyu10.top';

class PaymentGateway {
    constructor(baseUrl = BASE_URL, merchantId = MERCHANT_ID, privateKey = PRIVATE_KEY) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.merchantId = merchantId;
        this.privateKey = privateKey;
    }

    /**
     * Handle payment gateway request errors
     * @param {Error} error - Error object
     * @returns {Error} Formatted error
     */
    handleRequestError(error) {
        // Handle Axios-specific errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const { status, data } = error.response;
            const message = data?.msg || `Request failed with status code ${status}`;
            const customError = new Error(message);
            customError.statusCode = status;
            customError.isGatewayError = true;
            return customError;
        } else if (error.request) {
            // The request was made but no response was received
            const customError = new Error('No response from payment gateway. It might be down or unreachable.');
            customError.code = error.code; // e.g., 'ECONNRESET'
            customError.isGatewayError = true;
            return customError;
        }

        // Handle standard network errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            const customError = new Error('Unable to connect to payment gateway.');
            customError.code = error.code;
            customError.isGatewayError = true;
            return customError;
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            const customError = new Error('Payment gateway request timed out.');
            customError.code = error.code;
            customError.isGatewayError = true;
            return customError;
        }

        // Fallback for other types of errors
        error.isGatewayError = true;
        return error;
    }

    /**
     * Send request to payment gateway
     * @param {string} path - API endpoint path
     * @param {Object} data - Request data
     * @returns {Promise<Object>} Response data
     */
    async sendRequest(path, data) {
        // Internal validation helper
        const validatePaymentData = (data) => {
            const errors = [];
            const requiredFields = {
                mch_id: { type: 'string', required: true },
                mch_order_no: { type: 'string', required: true },
                notifyUrl: { type: 'string', required: false, maxLength: 200 },
                page_url: { type: 'string', required: false, maxLength: 200 },
                trade_amount: { type: 'number', required: false },
                currency: { type: 'string', required: false },
                pay_type: { type: 'string', required: false },
                payer_phone: { type: 'number', required: false },
                attach: { type: 'string', required: false, maxLength: 200 }
            };
            for (const [field, rules] of Object.entries(requiredFields)) {
                const value = data[field];
                if (rules.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${field} is required`);
                    continue;
                }
                if (!rules.required && (value === undefined || value === null)) {
                    continue;
                }
                if (rules.type === 'number') {
                    if (typeof value !== 'number' && isNaN(Number(value))) {
                        errors.push(`${field} must be a number`);
                    }
                } else if (rules.type === 'string') {
                    if (typeof value !== 'string') {
                        errors.push(`${field} must be a string`);
                    }
                    if (rules.maxLength && value.length > rules.maxLength) {
                        errors.push(`${field} must not exceed ${rules.maxLength} bytes`);
                    }
                }
            }
            return {
                isValid: errors.length === 0,
                errors
            };
        };
        // Internal signature helper
        const generateSignature = (data) => {
            try {
                const signData = { ...data };
                delete signData.sign;
                delete signData.sign_type;
                const sortedKeys = Object.keys(signData).sort();
                let concatenatedString = '';
                for (const key of sortedKeys) {
                    const value = signData[key];
                    if (value !== null && value !== '' && key !== 'sign' && key !== 'sign_type') {
                        concatenatedString += `${key}=${value}&`;
                    }
                }
                concatenatedString = concatenatedString.slice(0, -1) + `&key=${this.privateKey}`;
                return md5(concatenatedString).toLowerCase();
            } catch (error) {
                console.error('Error generating signature:', error);
                throw new Error('Failed to generate signature');
            }
        };
        try {
            // Validate request data
            const validation = validatePaymentData(data);
            if (!validation.isValid) {
                throw new Error(`Invalid payment data: ${validation.errors.join(', ')}`);
            }
            // Generate signature and add to data
            const sign = generateSignature(data);
            const requestData = {
                ...data,
                sign,
                sign_type: 'MD5'
            };
            // Convert to form data
            const formData = new URLSearchParams();
            Object.entries(requestData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            });
            // Log request data for debugging
            console.log('Payment request:', {
                url: `${this.baseUrl}${path}`,
                data: Object.fromEntries(formData)
            });
            // Send request with browser-like headers
            const response = await axios.post(
                `${this.baseUrl}${path}`,
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Origin': this.baseUrl,
                        'Referer': `${this.baseUrl}/`
                    },
                    timeout: 10000 // 10 second timeout
                }
            );
            // Log response for debugging
            console.log('Payment response:', response.data);
            // Validate response format
            if (!response.data || typeof response.data !== 'object') {
                throw new Error('Invalid response format');
            }
            return response.data;
        } catch (error) {
            console.error('Payment gateway request error:', error);
            throw this.handleRequestError(error);
        }
    }

    /**
     * Initiate payment collection
     * @param {Object} data - Payment data
     * @returns {Promise<Object>} Response data
     */
    async initiatePayment(data) {
        return this.sendRequest('/api/payGate/payCollect', data);
    }

    /**
     * Query payment status
     * @param {Object} data - Query data
     * @returns {Promise<Object>} Response data
     */
    async queryPayment(data) {
        return this.sendRequest('/api/query/payCollect', data);
    }

    /**
     * Query order status
     * @param {Object} data - Query data
     * @returns {Promise<Object>} Response data
     */
    async queryOrder(data) {
        return this.sendRequest('/api/query/payOrder', data);
    }

    /**
     * Initiate payment order (transfer)
     * @param {Object} data - Order data
     * @returns {Promise<Object>} Response data
     */
    async initiateOrder(data) {
        return this.sendRequest('/api/payGate/payOrder', data);
    }
}

module.exports = PaymentGateway; 
