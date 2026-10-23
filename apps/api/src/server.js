import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'node:module';
import { z } from 'zod';
import { prisma } from './db.js';
import { authRouter, dashboardRouter, projectRouter, userRouter, accessRouter, secretRouter, auditRouter, policyRouter, incidentRouter } from './routes/index.js';
import { isAllowedOrigin } from './middleware/auth.js';

// Express 4 does not forward rejected promises from async route handlers.
// Forward them to the error middleware so request failures do not crash the API.
const require = createRequire(import.meta.url);
const Layer = require('express/lib/router/layer');
Layer.prototype.handle_request = function handleRequest(req, res, next) {
  const handler = this.handle;
  if (handler.length > 3) return next();
  try {
    const result = handler.call(this, req, res, next);
    if (result && typeof result.then === 'function') result.catch(next);
    return result;
  } catch (error) {
    return next(error);
  }
};

const auditKey = Buffer.from(process.env.AUDIT_HMAC_KEY || '', 'base64');
if (auditKey.length !== 32) throw new Error('Set AUDIT_HMAC_KEY to a base64-encoded 32-byte random value.');
if (process.env.NODE_ENV === 'production') throw new Error('Production startup is blocked until an external KMS/HSM provider is configured.');
if (Buffer.from(process.env.DEV_KEK_BASE64 || '', 'base64').length !== 32) throw new Error('Set DEV_KEK_BASE64 to a base64-encoded 32-byte development-only value.');

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors({ origin(origin, callback) { if (!origin || isAllowedOrigin(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS.')); }, credentials: true }));
app.use(express.json({ limit: '128kb' }));
app.use(cookieParser());
app.get('/health', async (_req, res) => { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok' }); });
const api = express.Router();
api.use(rateLimit({ windowMs: 15 * 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));
api.use('/auth', rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }), authRouter);
api.use('/dashboard', dashboardRouter);
api.use('/projects', projectRouter);
api.use('/users', userRouter);
api.use('/access-requests', accessRouter);
api.use('/secrets', secretRouter);
api.use('/audit', auditRouter);
api.use('/policies', policyRouter);
api.use('/incidents', incidentRouter);
app.use('/api/v1', api);
app.use((err, req, res, _next) => {
  if (err instanceof z.ZodError) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.', fields: err.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) } });
  if (err?.code === 'P2002') return res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with those details already exists.' } });
  if (err?.name === 'PrismaClientInitializationError' || err?.code === 'P1001') return res.status(503).json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'The vault database is unavailable. Start PostgreSQL, then retry.' } });
  console.error('request_failed', { path: req.path, method: req.method, name: err?.name, code: err?.code ?? null });
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' } });
});
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Centralized Secret Vault API listening on ${port}`));
