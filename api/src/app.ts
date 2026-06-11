import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import timeout from 'connect-timeout';
import swaggerUi from 'swagger-ui-express';
import { validateEnv, env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { createApiLimiter, createAuthLimiter, createPasswordResetLimiter } from './middlewares/rateLimit.middleware';
import { swaggerSpec } from './config/swagger';
import './config/passport';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import propertiesRouter from './modules/properties/properties.routes';
import inquiriesRouter from './modules/inquiries/inquiries.routes';
import paymentsRouter from './modules/payments/payments.routes';
import mediaRouter from './modules/media/media.routes';
import favoritesRouter from './modules/favorites/favorites.routes';
import featureRequestsRouter from './modules/feature-requests/feature-requests.routes';

validateEnv();

const app: Application = express();

// ─── Security ─────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

app.disable('x-powered-by');

const corsOrigin = env.clientUrl;
if (!corsOrigin && process.env.NODE_ENV === 'production') {
  console.warn('CLIENT_URL is not set. CORS will be restrictive.');
}
app.use(
  cors({
    origin: corsOrigin || false,
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────
const apiLimiter = createApiLimiter();
app.use('/api', apiLimiter);

const authLimiter = createAuthLimiter();
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/refresh', authLimiter);

const passwordResetLimiter = createPasswordResetLimiter();
app.use('/api/v1/auth/forgot-password', passwordResetLimiter);

// ─── Parsing & Compression ────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(compression());

// ─── Timeout ──────────────────────────────────
app.use(timeout('30s'));
app.use((req, res, next) => {
  if ((req as any).timedout) return;
  next();
});

// ─── Logging ──────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Swagger ──────────────────────────────────
if (env.nodeEnv !== 'production') {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Immo Platform API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
}

// ─── Health Check ─────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    docs: `/api/docs`,
  });
});

// ─── Routes ───────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/properties', propertiesRouter);
app.use('/api/v1/inquiries', inquiriesRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/properties', mediaRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/feature-requests', featureRequestsRouter);

// ─── 404 Handler ──────────────────────────────
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, message: 'Route not found but API is online' });
});

// ─── Global Error Handler ─────────────────────
app.use(errorMiddleware);

export default app;
