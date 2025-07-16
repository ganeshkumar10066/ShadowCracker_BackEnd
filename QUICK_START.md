# 🚀 Quick Start Guide

## Immediate Fix for Current Issues

### 1. **MongoDB Connection Issue**

The main problem is that MongoDB is not running. Here are the solutions:

#### Option A: Use Docker (Recommended)
```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Or use the provided docker-compose
docker-compose up mongo -d
```

#### Option B: Install MongoDB Locally
```bash
# Windows (using chocolatey)
choco install mongodb

# macOS (using homebrew)
brew install mongodb-community

# Linux (Ubuntu/Debian)
sudo apt-get install mongodb
```

#### Option C: Use the Auto-Start Script
```bash
# This will try to start MongoDB automatically
npm run start:mongo
```

### 2. **Start the Backend**

After MongoDB is running:

```bash
# Install dependencies (if not done already)
npm install

# Start the backend
npm start

# Or for development with auto-reload
npm run dev
```

### 3. **Verify Everything is Working**

Visit: `http://localhost:3001/health`

You should see:
```json
{
  "code": 0,
  "msg": "Server is running",
  "data": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "environment": "development",
    "database": "connected"
  }
}
```

## 🔧 Environment Setup

Create a `.env` file in the backend directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shadowcracker

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Payment Gateway Configuration
PAYMENT_MERCHANT_ID=85071336
PAYMENT_PRIVATE_KEY=f7b3eb7e62f0c439763048c403ee158a
PAYMENT_GATEWAY_URL=https://xyu10.top/api/payGate/payCollect

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=your_secret_key_here
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🐳 Docker Setup (Easiest)

```bash
# Start everything with Docker
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

## 📊 Monitoring

- **Health Check**: `http://localhost:3001/health`
- **Logs**: Check `logs/` directory
- **MongoDB Admin**: `http://localhost:8081` (if using docker-compose)

## 🚨 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
netstat -an | grep 27017

# Start MongoDB manually
mongod --dbpath ./data/db
```

### Port Already in Use
```bash
# Check what's using port 3001
netstat -ano | findstr :3001

# Kill the process or change port in .env
PORT=3002
```

### Permission Issues
```bash
# Create logs directory
mkdir -p logs

# Set proper permissions
chmod 755 logs
```

## ✅ Success Indicators

When everything is working correctly, you should see:

```
🚀 Server running at http://0.0.0.0:3001
📊 Environment: development
🔗 Health check: http://0.0.0.0:3001/health
✅ MongoDB Connected: localhost:27017
✅ Routes initialized successfully
```

## 🆘 Still Having Issues?

1. **Check MongoDB**: Make sure MongoDB is running on port 27017
2. **Check Ports**: Ensure port 3001 is not in use
3. **Check Logs**: Look at the console output for specific errors
4. **Use Docker**: Try the docker-compose setup for a clean environment

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review the UPGRADE_SUMMARY.md for what was changed
- Check the logs in the `logs/` directory 