import crypto from 'node:crypto';
import serverless from 'serverless-http';
import app from './server.js';

const runExpress = serverless(app);
const bodylessMethods = new Set(['GET', 'HEAD']);

function getMultiValueQuery(searchParams) {
  const values = {};
  for (const [key, value] of searchParams) {
    (values[key] ||= []).push(value);
  }
  return values;
}

function appendResponseHeaders(headers, values) {
  for (const [name, value] of Object.entries(values || {})) {
    const valuesToAppend = Array.isArray(value) ? value : [value];
    for (const entry of valuesToAppend) {
      if (entry !== undefined && entry !== null) headers.append(name, String(entry));
    }
  }
}

export async function handleApiRequest(request) {
  const url = new URL(request.url);
  const headers = Object.fromEntries(request.headers.entries());
  const queryStringParameters = Object.fromEntries(url.searchParams.entries());
  const event = {
    httpMethod: request.method,
    path: url.pathname,
    headers,
    multiValueHeaders: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, [value]])),
    queryStringParameters,
    multiValueQueryStringParameters: getMultiValueQuery(url.searchParams),
    requestContext: {
      httpMethod: request.method,
      path: url.pathname,
      stage: '$default',
      requestId: headers['x-vercel-id'] || crypto.randomUUID(),
      identity: { sourceIp: headers['x-forwarded-for']?.split(',')[0]?.trim() || '127.0.0.1' },
    },
    body: bodylessMethods.has(request.method) ? undefined : await request.text(),
    isBase64Encoded: false,
  };

  const result = await runExpress(event, {});
  const responseHeaders = new Headers();
  appendResponseHeaders(responseHeaders, result.multiValueHeaders);
  appendResponseHeaders(responseHeaders, result.headers);
  const responseBody = result.isBase64Encoded
    ? Buffer.from(result.body || '', 'base64')
    : result.body || null;

  return new Response(request.method === 'HEAD' ? null : responseBody, {
    status: result.statusCode || 200,
    headers: responseHeaders,
  });
}
