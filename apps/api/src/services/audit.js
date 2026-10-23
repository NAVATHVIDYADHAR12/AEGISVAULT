import crypto from 'node:crypto';
import { prisma } from '../db.js';
function auditKey() {
  if (!process.env.AUDIT_HMAC_KEY) throw new Error('AUDIT_HMAC_KEY is not configured');
  const key = Buffer.from(process.env.AUDIT_HMAC_KEY, 'base64');
  if (key.length !== 32) throw new Error('AUDIT_HMAC_KEY must encode 32 random bytes');
  return key;
}
export async function appendAudit({ organizationId, actorId = null, action, resourceType, resourceId = null, metadata }) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${organizationId})) IS NULL AS locked`;
    const prior = await tx.auditEvent.findFirst({ where: { organizationId }, orderBy: { sequence: 'desc' }, select: { eventHash: true, sequence: true } });
    const createdAt = new Date();
    const previousHash = prior?.eventHash ?? null;
    const sequence = (prior?.sequence ?? 0) + 1;
    const payload = JSON.stringify({ organizationId, actorId, action, resourceType, resourceId, metadata: metadata ?? null, previousHash, createdAt: createdAt.toISOString() });
    const eventHash = crypto.createHmac('sha256', auditKey()).update(payload).digest('hex');
    return tx.auditEvent.create({ data: { organizationId, actorId, action, resourceType, resourceId, metadata, previousHash, eventHash, sequence, createdAt } });
  });
}
export async function verifyAudit(organizationId) {
  const events = await prisma.auditEvent.findMany({ where: { organizationId }, orderBy: { sequence: 'asc' } });
  let previousHash = null;
  let sequence = 0;
  for (const event of events) {
    sequence += 1;
    const payload = JSON.stringify({ organizationId, actorId: event.actorId, action: event.action, resourceType: event.resourceType, resourceId: event.resourceId, metadata: event.metadata ?? null, previousHash, createdAt: event.createdAt.toISOString() });
    const expected = crypto.createHmac('sha256', auditKey()).update(payload).digest('hex');
    if (event.sequence !== sequence || event.previousHash !== previousHash || event.eventHash.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(event.eventHash), Buffer.from(expected))) return { valid: false, checked: events.length, failedAt: event.id };
    previousHash = event.eventHash;
  }
  return { valid: true, checked: events.length, checkpointedExternally: false };
}
