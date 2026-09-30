import { prisma } from '@/lib/db/prisma';

export type AuditAction =
  | 'CREDENTIALS_ISSUED'
  | 'DIRECT_INVITE_SENT'
  | 'COMMUNITY_JOIN_REQUESTED'
  | 'PROFILE_UPDATED'
  | 'MEDIA_UPLOADED'
  | 'PLAYER_LOGGED_IN'
  | 'STATUS_MODIFIED'
  | 'BROADCAST_SENT';

export type AuditSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  actor: string;
  target?: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

// Clean in-memory runtime cache (0 fake data)
const globalStore = globalThis as unknown as {
  auditLogs?: AuditLogItem[];
};

if (!globalStore.auditLogs) {
  globalStore.auditLogs = [];
}

export const auditLogs = globalStore.auditLogs;

export async function recordAuditLog(
  action: AuditAction,
  actor: string,
  details: string,
  target?: string,
  severity: AuditSeverity = 'INFO',
  ipAddress: string = '127.0.0.1'
) {
  const newLog: AuditLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    severity,
    actor,
    target,
    details,
    ipAddress,
    timestamp: new Date().toISOString(),
  };

  auditLogs.unshift(newLog);

  // Keep last 200 items in runtime memory cache
  if (auditLogs.length > 200) {
    auditLogs.pop();
  }

  // Persist directly to PostgreSQL database
  try {
    await prisma.auditLog.create({
      data: {
        action,
        severity,
        actor,
        target: target || null,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    // Database connection fallback
  }

  return newLog;
}

import { unstable_cache } from 'next/cache';

async function fetchAuditLogsFromDb(): Promise<AuditLogItem[]> {
  try {
    const dbLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (dbLogs && dbLogs.length > 0) {
      return dbLogs.map((l) => ({
        id: l.id,
        action: l.action as AuditAction,
        severity: (l.severity || 'INFO') as AuditSeverity,
        actor: l.actor,
        target: l.target || undefined,
        details: l.details,
        ipAddress: l.ipAddress || undefined,
        timestamp: l.createdAt.toISOString(),
      }));
    }
  } catch {
    // Database fallback to runtime memory
  }

  return [...auditLogs];
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  const getCached = unstable_cache(
    fetchAuditLogsFromDb,
    ['db-audit-logs-list'],
    { revalidate: 15, tags: ['audit-logs'] }
  );
  return getCached();
}
