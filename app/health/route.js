import { handleApiRequest } from '../../apps/api/src/serverless.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const GET = handleApiRequest;
