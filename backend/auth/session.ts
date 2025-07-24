import { timingSafeEqual } from 'crypto';

import { eq } from 'drizzle-orm';

import { db, tables } from '../db';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const IDLE_TIMEOUT_SECONDS = 60 * 60 * 24 * 7; // 7 days inactivity

export const generateSessionId = (bytes = 32): string => {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Buffer.from(buf).toString('base64url').replace(/=+$/, '');
};

export const createSession = async (userId: string) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const idleExpiresAt = new Date(now.getTime() + IDLE_TIMEOUT_SECONDS * 1000);
  const id = generateSessionId();
  await db.insert(tables.sessions).values({ id, userId, expiresAt, idleExpiresAt });
  return { id, userId, expiresAt, idleExpiresAt };
}

// cookie name
export const SESSION_COOKIE = 'session';

export const buildSessionCookie = (id: string, expiresAt: Date, prod: boolean) => {
  const attrs = [
    `${SESSION_COOKIE}=${id}`,
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expiresAt.toUTCString()}`,
    'Path=/',
  ];
  if (prod) {
    attrs.push('Secure');
  }
  return attrs.join('; ');
}

export const deleteSessionCookie = (prod: boolean) => {
  const attrs = [
    `${SESSION_COOKIE}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Path=/',
  ];
  if (prod) {
    attrs.push('Secure');
  }
  return attrs.join('; ');
}

export const validateSession = async (sessionId: string) => {
  // constant-time-ish check: pull candidate row and const-compare ids
  // Use findFirst to ensure we only get one row, as session IDs are unique.
  const s = await db.query.sessions.findFirst({
    where: eq(tables.sessions.id, sessionId)
  });
  if (!s) {
    return undefined;
  }

  // timing safe compare (avoid early bailout)
  const ok = timingSafeEqual(Buffer.from(s.id), Buffer.from(sessionId));
  if (!ok) {
    return undefined;
  }

  const now = new Date();
  if (now >= s.expiresAt) {
    await invalidateSession(sessionId);
    return undefined;
  }
  if (now >= s.idleExpiresAt) {
    await invalidateSession(sessionId);
    return undefined;
  }
  // refresh idle timeout
  const newIdle = new Date(now.getTime() + IDLE_TIMEOUT_SECONDS * 1000);
  await db
    .update(tables.sessions)
    .set({ idleExpiresAt: newIdle })
    .where(eq(tables.sessions.id, sessionId));
  return { ...s, idleExpiresAt: newIdle };
}

export const invalidateSession = async (sessionId: string) => {
  await db.delete(tables.sessions).where(eq(tables.sessions.id, sessionId));
}

export const invalidateAllSessions = async (userId: string) => {
  await db.delete(tables.sessions).where(eq(tables.sessions.userId, userId));
}
