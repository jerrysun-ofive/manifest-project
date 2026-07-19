import cors from 'cors';
import express from 'express';
import { formRouter } from './routes/formRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/forms', formRouter);

  return app;
}
