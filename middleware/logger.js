const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length') || 0
    };

    console.log(`📝 ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    
    // Write to log file
    const logFile = path.join(logsDir, 'requests.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  });

  next();
};

const errorLogger = (err, req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };

  console.error('❌ Error:', err.message);
  
  // Write to error log file
  const errorLogFile = path.join(logsDir, 'errors.log');
  fs.appendFileSync(errorLogFile, JSON.stringify(logEntry) + '\n');

  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
}; 