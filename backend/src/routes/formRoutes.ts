import { Router } from 'express';
import { getSampleForm } from '../services/formValidationService.js';

export const formRouter = Router();

formRouter.get('/sample', (_req, res) => {
  res.json(getSampleForm());
});
