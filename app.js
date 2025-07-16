const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import configuration and middleware
const config = require('./config/config');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger, errorLogger } = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize express app
const app = express();

// Create public directory for static files
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create default avatar if it doesn't exist
const defaultAvatarPath = path.join(publicDir, 'default-avatar.png');
if (!fs.existsSync(defaultAvatarPath)) {
  // Create a simple default avatar (1x1 transparent pixel)
  const defaultAvatar = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(defaultAvatarPath, defaultAvatar);
}

// Security middleware
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: config.upload.maxSize }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxSize }));

// Rate limiting
app.use(apiLimiter);

// Request logging
app.use(requestLogger);

// Serve static files
app.use('/public', express.static(publicDir, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    code: 0,
    msg: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      database: 'connected' // We'll update this after DB connection
    }
  });
});

// Import routes
const profileRoutes = require('./routes/profile');
const imageRoutes = require('./routes/image');
const paymentRoutes = require('./routes/paymentRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const instagramCookieRoutes = require('./routes/instagramCookieRoutes');

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/proxies', proxyRoutes);
app.use('/api/instagram-cookies', instagramCookieRoutes);

// Error logging
app.use(errorLogger);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    code: -1,
    msg: 'Route not found',
    data: null
  });
});

// Start server only after successful DB connection
const PORT = config.port;
connectDB()
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error.message);
    process.exit(1);
  });

module.exports = app; 