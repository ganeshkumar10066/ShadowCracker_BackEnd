require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://kevinkumar0a2:gSofu73BFxv7wjrd@cluster0.moua0ds.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    options: {
      // Removed deprecated options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  
  // CORS Configuration
  cors: {
    origin: 'https://shadowcracker.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  // Payment Configuration
  payment: {
    merchantId: process.env.PAYMENT_MERCHANT_ID || '85071336',
    privateKey: process.env.PAYMENT_PRIVATE_KEY || 'f7b3eb7e62f0c439763048c403ee158a',
    gatewayUrl: process.env.PAYMENT_GATEWAY_URL || 'https://xyu10.top/api/payGate/payCollect',
    currency: 'INR',
    payType: 'INDIA_UPI'
  },
  
  // Telegram Configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8090638922:AAHbDGRREsIhXeE1xzMNy3ywi7KLiydqZ4Y',
    chatId: process.env.TELEGRAM_CHAT_ID || '6300393008'
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'e168d2431696edbc4fe918851c90cb1e2b4488ec',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // File Upload
  upload: {
    maxSize: '50mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
};

module.exports = config; 
