# Quickstart Guide: IronPulse Gym Backend API

**Feature**: 002-gym-backend  
**Date**: 2026-04-20  
**Purpose**: Quick setup and development guide for the backend API

## Prerequisites

- Node.js v20+ (LTS)
- PostgreSQL database (Neon account recommended)
- Git
- Code editor (VS Code recommended)
- API testing tool (Postman, Thunder Client, or curl)

## Initial Setup

### 1. Create Backend Directory

```bash
mkdir backend
cd backend
```

### 2. Initialize Node.js Project

```bash
npm init -y
```

### 3. Install Dependencies

```bash
# Core dependencies
npm install express typescript ts-node-dev @types/express @types/node

# Database
npm install prisma @prisma/client

# Authentication & Security
npm install bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
npm install helmet cors dotenv

# Validation
npm install zod

# Testing (optional for MVP)
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

### 4. Initialize TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` file

### 6. Configure Environment Variables

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

Create `.env.example` (for version control):
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="change-this-to-a-secure-secret"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 7. Setup Prisma Schema

Copy the schema from `data-model.md` to `prisma/schema.prisma`, then:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 8. Create Folder Structure

```bash
mkdir -p src/{controllers,routes,middleware,utils,schemas,config,types}
mkdir -p tests/integration
```

### 9. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio",
    "test": "jest --watchAll --verbose"
  }
}
```

## Development Workflow

### Phase 1: Core Setup (Day 1)

1. **Create Prisma Client Config** (`src/config/prisma.ts`):
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

2. **Create Response Utilities** (`src/utils/response.ts`):
```typescript
export const successResponse = (message: string, data: any) => ({
  success: true,
  message,
  data
});

export const errorResponse = (message: string, error?: string) => ({
  success: false,
  message,
  error
});
```

3. **Create Basic Server** (`src/server.ts`):
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

4. **Test Server**:
```bash
npm run dev
# Visit http://localhost:5000/health
```

### Phase 2: Authentication (Day 2-3)

1. Create password utilities (`src/utils/password.ts`)
2. Create JWT utilities (`src/utils/jwt.ts`)
3. Create auth schemas (`src/schemas/auth.schema.ts`)
4. Create auth controller (`src/controllers/auth.controller.ts`)
5. Create auth routes (`src/routes/auth.routes.ts`)
6. Mount routes in `server.ts`

**Test with Postman**:
- POST `/api/v1/auth/signup` with name, email, password
- POST `/api/v1/auth/login` with email, password
- Verify JWT token returned

### Phase 3: Middleware (Day 2)

1. Create auth middleware (`src/middleware/auth.middleware.ts`)
2. Create validation middleware (`src/middleware/validate.middleware.ts`)
3. Create error middleware (`src/middleware/error.middleware.ts`)
4. Create admin middleware (`src/middleware/admin.middleware.ts`)

### Phase 4: Plans Management (Day 3-4)

1. Create plan schemas (`src/schemas/plan.schema.ts`)
2. Create plan controller (`src/controllers/plan.controller.ts`)
3. Create plan routes (`src/routes/plan.routes.ts`)
4. Mount routes in `server.ts`

**Test with Postman**:
- GET `/api/v1/plans` (public)
- POST `/api/v1/plans` (admin only, with JWT token)
- PUT `/api/v1/plans/:id` (admin only)
- DELETE `/api/v1/plans/:id` (admin only)

### Phase 5: Bookings (Day 4-5)

1. Create booking schemas (`src/schemas/booking.schema.ts`)
2. Create booking controller (`src/controllers/booking.controller.ts`)
3. Create booking routes (`src/routes/booking.routes.ts`)
4. Mount routes in `server.ts`

**Test with Postman**:
- POST `/api/v1/bookings` (with JWT token, planId, bookingDate)
- GET `/api/v1/bookings` (with JWT token)
- DELETE `/api/v1/bookings/:id` (with JWT token)

### Phase 6: User Profile (Day 5)

1. Create user schemas (`src/schemas/user.schema.ts`)
2. Create user controller (`src/controllers/user.controller.ts`)
3. Create user routes (`src/routes/user.routes.ts`)
4. Mount routes in `server.ts`

**Test with Postman**:
- GET `/api/v1/user/profile` (with JWT token)
- PUT `/api/v1/user/profile` (with JWT token, name and/or email)

## Testing Strategy

### Manual Testing with Postman

1. **Create Postman Collection**:
   - Import OpenAPI contracts from `contracts/` directory
   - Or manually create requests for each endpoint

2. **Test Flow**:
   - Signup → Save token
   - Login → Save token
   - Get plans (no token needed)
   - Create booking (with token)
   - Get bookings (with token)
   - Get profile (with token)
   - Update profile (with token)

3. **Environment Variables in Postman**:
   - `baseUrl`: http://localhost:5000/api/v1
   - `token`: (set after login/signup)

### Automated Testing (Optional)

Create `tests/integration/auth.test.ts`:
```typescript
import request from 'supertest';
import app from '../src/server';

describe('Auth Endpoints', () => {
  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});
```

Run tests:
```bash
npm test
```

## Common Issues & Solutions

### Issue: Prisma Client not found
**Solution**: Run `npx prisma generate`

### Issue: Database connection error
**Solution**: Check DATABASE_URL in `.env`, ensure database is accessible

### Issue: JWT token invalid
**Solution**: Ensure JWT_SECRET is set and consistent, check token format in Authorization header

### Issue: CORS error from frontend
**Solution**: Verify FRONTEND_URL in `.env` matches frontend domain

### Issue: TypeScript compilation errors
**Solution**: Run `npm run build` to see detailed errors, check tsconfig.json

## Deployment Checklist

### Pre-deployment

- [ ] All environment variables configured on deployment platform
- [ ] Database migrations run successfully
- [ ] JWT_SECRET is strong and secure (min 32 characters)
- [ ] CORS configured for production frontend domain
- [ ] Error messages don't expose sensitive information
- [ ] All endpoints tested manually
- [ ] TypeScript compilation successful (`npm run build`)

### Deployment Platforms

**Render**:
1. Connect GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

**Railway**:
1. Connect GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically

## Next Steps

After completing the backend:
1. Connect frontend to backend API
2. Test full integration (frontend → backend → database)
3. Add error logging (e.g., Sentry)
4. Add API documentation (Swagger UI)
5. Implement rate limiting
6. Add automated tests
7. Setup CI/CD pipeline

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload
npm run build                  # Compile TypeScript
npm start                      # Start production server

# Database
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Push schema to database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create migration (production)

# Testing
npm test                       # Run tests
npm test -- --coverage         # Run tests with coverage

# Debugging
npm run dev -- --inspect       # Start with Node debugger
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
