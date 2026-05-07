# IronPulse Gym Backend API

RESTful API backend for IronPulse Gym built with Node.js, Express.js, TypeScript, and Prisma ORM.

## Features

- 🔐 JWT-based authentication with bcrypt password hashing
- 👥 User registration and login
- 📋 Membership plans management (admin)
- 📅 Session booking system
- 👤 User profile management
- ✅ Input validation with Zod
- 🛡️ Security with Helmet and CORS
- 📊 PostgreSQL database with Prisma ORM

## Tech Stack

- **Runtime**: Node.js v20+ (LTS)
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 15+ (Neon)
- **ORM**: Prisma 5.x
- **Validation**: Zod 3.x
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS

## Prerequisites

- Node.js v20 or higher
- PostgreSQL database (Neon account recommended)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
   JWT_EXPIRES_IN="24h"
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

5. **Push database schema**
   ```bash
   npm run prisma:push
   ```

6. **Seed database (optional)**
   ```bash
   npm run prisma:seed
   ```

## Running the Server

### Development mode (with hot reload)
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

## API Endpoints

### Health Check
- `GET /api/health` - Server health check (public)

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user

### Plans (Public)
- `GET /api/v1/plans` - Get all membership plans
- `GET /api/v1/plans/:id` - Get plan by ID

### Plans (Admin Only)
- `POST /api/v1/plans` - Create new plan (requires admin role)
- `PUT /api/v1/plans/:id` - Update plan (requires admin role)
- `DELETE /api/v1/plans/:id` - Delete plan (requires admin role)

### Bookings (Protected)
- `POST /api/v1/bookings` - Create new booking (requires authentication)
- `GET /api/v1/bookings` - Get user's bookings (requires authentication)
- `DELETE /api/v1/bookings/:id` - Cancel booking (requires authentication)

### User Profile (Protected)
- `GET /api/v1/user/profile` - Get user profile (requires authentication)
- `PUT /api/v1/user/profile` - Update user profile (requires authentication)

## API Request/Response Examples

### Signup
**Request:**
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER",
      "createdAt": "2026-04-20T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**Request:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "MEMBER",
      "createdAt": "2026-04-20T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Booking
**Request:**
```bash
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "clx...",
  "bookingDate": "2026-05-01T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "clx...",
    "userId": "clx...",
    "planId": "clx...",
    "bookingDate": "2026-05-01T10:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2026-04-20T...",
    "plan": {
      "id": "clx...",
      "title": "Premium",
      "price": 49.99,
      "duration": 1,
      "features": ["..."]
    }
  }
}
```

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token is returned upon successful signup or login.

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

### User
- `id` (String, CUID)
- `name` (String)
- `email` (String, unique)
- `password` (String, hashed)
- `role` (Enum: MEMBER, ADMIN)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Plan
- `id` (String, CUID)
- `title` (String)
- `price` (Float)
- `duration` (Int, months)
- `features` (String[])
- `createdAt` (DateTime)

### Booking
- `id` (String, CUID)
- `userId` (String, FK)
- `planId` (String, FK)
- `bookingDate` (DateTime)
- `status` (Enum: PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `createdAt` (DateTime)

### Trainer
- `id` (String, CUID)
- `name` (String)
- `specialization` (String)
- `experience` (Int, years)
- `image` (String, URL)
- `bio` (String, optional)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data

## Frontend Integration

### CORS Configuration
The API is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable.

### Authentication Flow
1. User signs up or logs in
2. Frontend receives JWT token
3. Store token securely (localStorage or httpOnly cookie)
4. Include token in Authorization header for protected requests
5. Handle 401 errors by redirecting to login

### Example Frontend Integration (Axios)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Security Considerations

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 24 hours (configurable)
- CORS restricted to frontend domain
- Helmet middleware for security headers
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM
- Password field never included in API responses

## Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET (minimum 32 characters)
3. Configure DATABASE_URL with production database
4. Set FRONTEND_URL to production frontend domain

### Recommended Platforms
- **Render** - Easy deployment with PostgreSQL addon
- **Railway** - Simple deployment with database support
- **Heroku** - Classic PaaS option
- **DigitalOcean App Platform** - Managed deployment

### Deployment Steps (Render Example)
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database is accessible from your network
- Ensure SSL mode is configured correctly

### JWT Token Errors
- Verify JWT_SECRET is set and consistent
- Check token expiration time
- Ensure Authorization header format is correct

### CORS Errors
- Verify FRONTEND_URL matches your frontend domain
- Check CORS middleware configuration
- Ensure credentials are included in frontend requests

## License

ISC

## Support

For issues or questions, please contact the development team.
