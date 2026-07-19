import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getSampleForm } from '../src/services/formValidationService.js';

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/forms/sample', () => {
  it('returns the sample form payload', async () => {
    const response = await request(createApp()).get('/api/forms/sample');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(getSampleForm());
  });
});

describe('getSampleForm', () => {
  it('returns an empty form document', () => {
    expect(getSampleForm()).toEqual({
      title: 'Untitled form',
      description: '',
      fields: [],
    });
  });
});
