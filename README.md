# ShadowCracker Backend v2.0.0

A modern, secure, and scalable backend API for the ShadowCracker application with enhanced performance and security features.

## 🚀 Features

- **Enhanced Security**: Rate limiting, input validation, CORS protection
- **Comprehensive Logging**: Request/response logging with file output
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Configuration Management**: Environment-based configuration
- **Health Monitoring**: Built-in health check endpoint
- **Graceful Shutdown**: Proper process termination handling
- **API Documentation**: Well-structured API endpoints

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/shadowcracker
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:5173
   
   # Payment Gateway Configuration
   PAYMENT_MERCHANT_ID=your_merchant_id
   PAYMENT_PRIVATE_KEY=your_private_key
   
   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health status

### Profile Management
- `GET /api/profile/:username` - Get Instagram profile data
- `POST /api/profile` - Create/update profile

### Payment System
- `GET /api/payment/get-price/:username` - Get account pricing
- `POST /api/payment/store-search-data` - Store search data
- `POST /api/payment/inquiry` - Payment status inquiry
- `GET /api/payment/verify/:orderId` - Verify payment

### Password Management
- `GET /api/password/:username` - Get password data
- `POST /api/password` - Create password entry

### Proxy Management
- `GET /api/proxies` - Get available proxies
- `POST /api/proxies` - Add new proxy

### Instagram Cookies
- `GET /api/instagram-cookies` - Get available cookies
- `POST /api/instagram-cookies` - Add new cookie

### Image Management
- `GET /api/image/:filename` - Get image file
- `POST /api/image` - Upload image

## 🔧 Configuration

The application uses a centralized configuration system in `config/config.js`:

- **Database**: MongoDB connection settings
- **CORS**: Cross-origin resource sharing settings
- **Payment**: Payment gateway configuration
- **Security**: JWT, rate limiting, and encryption settings
- **Logging**: Log levels and file paths

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi-based request validation
- **CORS Protection**: Configurable cross-origin settings
- **Error Handling**: Secure error responses
- **Request Logging**: Comprehensive request tracking

## 📊 Monitoring

- **Health Check**: `/health` endpoint for monitoring
- **Request Logging**: All requests logged to `logs/requests.log`
- **Error Logging**: Errors logged to `logs/errors.log`
- **Performance**: Response time tracking

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔍 Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── logs/            # Log files
├── tests/           # Test files
└── app.js           # Main application file
```

### Adding New Routes

1. Create route file in `routes/` directory
2. Import and use in `app.js`
3. Add validation using Joi schemas
4. Implement proper error handling

### Adding New Services

1. Create service file in `services/` directory
2. Export functions for business logic
3. Use centralized error handling
4. Add proper logging

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t shadowcracker-backend .

# Run container
docker run -p 3001:3001 shadowcracker-backend
```

### Environment Variables
Make sure to set all required environment variables in production:
- `MONGODB_URI`
- `NODE_ENV=production`
- `PAYMENT_MERCHANT_ID`
- `PAYMENT_PRIVATE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## 📝 Changelog

### v2.0.0
- Complete backend rewrite with modern architecture
- Enhanced security features
- Comprehensive error handling
- Centralized configuration
- Improved logging system
- Rate limiting implementation
- Health monitoring
- Graceful shutdown handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team. 

## Instagram Cookie & Proxy Management

- All Instagram cookies are securely stored in the database and never hardcoded.
- Cookies are rotated and validated automatically for each request.
- Proxies are managed via the Proxy model and are randomly selected for each request.
- Advanced anti-rate-limit logic: random delays, fingerprint rotation, and proxy rotation are used to bypass Instagram's rate limits.
- All sensitive information is sanitized in logs and errors. 