import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { queueService } from './services/queue.service';

import authRouter from './routes/auth/auth';
import igAuthRouter from './routes/auth/instagram';
import liAuthRouter from './routes/auth/linkedin';
import accountsRouter from './routes/accounts';
import postsRouter from './routes/posts';
import templatesRouter from './routes/templates';
import analyticsRouter from './routes/analytics';
import aiRouter from './routes/ai';
import uploadRouter from './routes/upload';
import brandRouter from './routes/brand';
import campaignsRouter from './routes/campaigns';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use('/api', apiLimiter);

// Minimal safe health check (Zero infrastructure leakage)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/auth/instagram', igAuthRouter);
app.use('/api/auth/linkedin', liAuthRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/brand', brandRouter);
app.use('/api/campaigns', campaignsRouter);

// Start Queue Background Poller
queueService.startWorker();

// Static asset hosting for frontend build and user uploaded media
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Fallback SPA routing
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && req.path !== '/health') {
    const indexPath = path.join(publicDir, 'index.html');
    return res.sendFile(indexPath);
  }
  next();
});

app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

app.use(errorHandler);

export default app;
