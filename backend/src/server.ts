import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import { success } from './utils/response';
import authRoutes from './routes/auth.routes';
import planRoutes from './routes/plan.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import subscriptionRoutes from './routes/subscription.routes';
import trainerRoutes from './routes/trainer.routes';
import testimonialRoutes from './routes/testimonial.routes';
import uploadRoutes from './routes/upload.routes';
import chatRoutes from './routes/chat.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import analyticsRoutes from './routes/analytics.routes';
import { handleStripeWebhook } from './webhooks/stripe.webhook';

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

console.log('🔐 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list or matches Vercel preview deployments
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Webhook route MUST be before express.json() to get raw body
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json(success('Server is running', { status: 'healthy', timestamp: new Date().toISOString() }));
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1', chatRoutes);
app.use('/api/v1/admin/knowledge', knowledgeRoutes);
app.use('/api/v1/admin/analytics', analyticsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://192.168.0.102:${PORT}`);
  });
}

export default app;
