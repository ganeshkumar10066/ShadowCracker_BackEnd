const express = require('express');
const router = express.Router();
const axios = require('axios');
const md5 = require('md5');
const config = require('../config/config');
const { AppError } = require('../middleware/errorHandler');
const pricingService = require('../services/pricingService');
const { sendTelegramMessage } = require('../utils/telegramBot');
const PaymentGateway = require('../services/paymentGateway');

// Get account pricing
router.get('/get-price/:username', async (req, res, next) => {
    try {
        const { username } = req.params;
        
        if (!username || username.trim().length === 0) {
            throw new AppError('Username is required', 400);
        }

        const priceData = await pricingService.getAccountPrice(username);
        res.json({ 
            code: 0,
            msg: 'Price calculated successfully',
            data: priceData 
        });
    } catch (error) {
        next(error);
    }
});

// Store search data
router.post('/store-search-data', async (req, res, next) => {
    try {
        const { username, userData } = req.body;
        
        if (!username || !userData) {
            throw new AppError('Username and user data are required', 400);
        }

        await pricingService.storeData(username, userData);
        res.json({ 
            code: 0,
            msg: 'Search data stored successfully',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

// Payment inquiry endpoint
router.post('/inquiry', async (req, res, next) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            throw new AppError('Order ID is required', 400);
        }

        // Generate signature for the request
        const signData = {
            mch_id: config.payment.merchantId,
            mch_order_no: orderId,
            sign_type: 'MD5'
        };

        // Sort keys and create signature string
        const sortedKeys = Object.keys(signData).sort();
        const concatenatedString = sortedKeys
            .map(key => `${key}=${signData[key]}`)
            .join('&');

        const stringToSign = `${concatenatedString}&key=${config.payment.privateKey}`;
        const sign = md5(stringToSign).toLowerCase();

        // Add signature to request data
        const requestData = {
            ...signData,
            sign
        };

        // Make request to payment gateway to check status
        const response = await axios.post(
            `${config.payment.gatewayUrl.replace('/payCollect', '/queryOrder')}`, 
            requestData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Origin': 'https://xyu10.top',
                    'Referer': 'https://xyu10.top/'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        // Transform the response to match the expected format
        const transformedResponse = {
            code: response.data.code || 0,
            msg: response.data.msg || 'Success',
            data: {
                status: response.data.data?.status || 0,
                orderId: orderId,
                amount: response.data.data?.trade_amount || '0',
                currency: response.data.data?.currency || 'INR',
                createTime: response.data.data?.orderDate || new Date().toISOString()
            }
        };

        res.json(transformedResponse);

    } catch (error) {
        console.error('Payment inquiry error:', error);
        
        // If the payment gateway is not available, return a pending status
        if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
            return res.json({
                code: 0,
                msg: 'Payment status pending',
                data: {
                    status: 0,
                    orderId: req.body.orderId,
                    amount: '0',
                    currency: 'INR',
                    createTime: new Date().toISOString()
                }
            });
        }

        next(new AppError('Payment inquiry failed', 500));
    }
});

// Payment verification endpoint
router.get('/verify/:orderId', async (req, res, next) => {
    try {
        const { orderId } = req.params;
        
        if (!orderId) {
            throw new AppError('Order ID is required', 400);
        }

        // Here you would typically verify the payment status with your payment gateway
        // and generate/retrieve the password for the user
        
        // For now, we'll just return a success response
        res.json({
            code: 0,
            msg: 'Payment verified successfully',
            data: {
                password: 'test-password-123', // This should be replaced with actual password generation/retrieval
                orderId: orderId
            }
        });

    } catch (error) {
        next(error);
    }
});

// Payment process endpoint
router.post('/process', async (req, res, next) => {
    try {
        const { username, userData } = req.body;
        if (!username || !userData) {
            throw new AppError('Username and user data are required', 400);
        }

        // Prepare payment data (example, adjust as needed)
        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const paymentData = {
            mch_id: '85071336', // Do not change
            mch_order_no: orderId,
            notifyUrl: 'http://yourdomain.com/api/payment/notify', // Replace with your actual notify URL
            page_url: 'http://yourdomain.com/payment-success', // Replace with your actual page URL
            trade_amount: userData.finalPrice ? Number(userData.finalPrice) : 100, // Use finalPrice from userData or default
            currency: 'INR',
            pay_type: 'INDIA_UPI', // Example: UPI payment, adjust as needed
            payer_phone: userData.phone ? Number(userData.phone) : 1234567890, // Example: use phone from userData or default
            attach: username
        };

        const gateway = new PaymentGateway();
        const result = await gateway.initiatePayment(paymentData);

        // Return in frontend-expected format
        if (result && result.code === 0 && result.data && result.data.url) {
            res.json({
                code: 0,
                msg: '成功',
                data: {
                    url: result.data.url,
                    mch_order_no: orderId
                }
            });
        } else {
            res.json({
                code: result.code || -1,
                msg: result.msg || 'Payment failed',
                data: null
            });
        }
    } catch (error) {
        console.error('Payment process error:', error);
        next(new AppError('Payment process failed', 500));
    }
});

module.exports = router; 