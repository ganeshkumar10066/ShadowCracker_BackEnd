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
     * Validate payment request parameters according to API documentation
     * @param {Object} data - Payment request data
     * @returns {Object} Validation result
     */
    validatePaymentData(data) {
        const errors = [];

        // Required fields with their types
        const requiredFields = {
            mch_id: { type: 'string', required: true },
            mch_order_no: { type: 'string', required: true },
            notifyUrl: { type: 'string', required: true, maxLength: 200 },
            page_url: { type: 'string', required: true, maxLength: 200 },
            trade_amount: { type: 'number', required: true },
            currency: { type: 'string', required: true },
            pay_type: { type: 'string', required: true },
            payer_phone: { type: 'number', required: true },
            attach: { type: 'string', required: true, maxLength: 200 }
        };

        // Validate each field
        for (const [field, rules] of Object.entries(requiredFields)) {
            const value = data[field];

            // Check if required field is present
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // Skip validation if value is not present and not required
            if (!rules.required && (value === undefined || value === null)) {
                continue;
            }

            // Type validation
            if (rules.type === 'number') {
                if (typeof value !== 'number' && isNaN(Number(value))) {
                    errors.push(`${field} must be a number`);
                }
            } else if (rules.type === 'string') {
                if (typeof value !== 'string') {
                    errors.push(`${field} must be a string`);
                }
                // Length validation for strings
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must not exceed ${rules.maxLength} bytes`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate signature following API documentation
     * @param {Object} data - Request data
     * @returns {string} MD5 signature in lowercase
     */
    generateSignature(data) {
        try {
            // Create a copy of data
            const signData = { ...data };
            
            // Remove sign and sign_type as per documentation
            delete signData.sign;
            delete signData.sign_type;

            // Sort by ASCII code
            const sortedKeys = Object.keys(signData).sort();
            
            // Build signature string
            let concatenatedString = '';
            for (const key of sortedKeys) {
                const value = signData[key];
                // Skip null, empty values, sign and sign_type
                if (value !== null && value !== '' && key !== 'sign' && key !== 'sign_type') {
                    concatenatedString += `${key}=${value}&`;
                }
            }
            
            // Remove trailing & and add private key
            concatenatedString = concatenatedString.slice(0, -1) + `&key=${this.privateKey}`;
            
            // Generate MD5 hash in lowercase
            return md5(concatenatedString).toLowerCase();
        } catch (error) {
            console.error('Error generating signature:', error);
            throw new Error('Failed to generate signature');
        }
    }

    /**
     * Send request to payment gateway
     * @param {string} path - API endpoint path
     * @param {Object} data - Request data
     * @returns {Promise<Object>} Response data
     */
    async sendRequest(path, data) {
        try {
            // Validate request data
            const validation = this.validatePaymentData(data);
            if (!validation.isValid) {
                throw new Error(`Invalid payment data: ${validation.errors.join(', ')}`);
            }

            // Generate signature and add to data
            const sign = this.generateSignature(data);
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

            // Send request with required headers
            const response = await axios.post(
                `${this.baseUrl}${path}`,
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
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
     * Handle payment gateway request errors
     * @param {Error} error - Error object
     * @returns {Error} Formatted error
     */
    handleRequestError(error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return new Error('Unable to connect to payment gateway');
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return new Error('Payment gateway request timed out');
        }
        return error;
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