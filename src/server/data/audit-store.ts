import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';

export type AuditAction =
  | 'CREDENTIALS_ISSUED'
  | 'DIRECT_INVITE_SENT'
  | 'COMMUNITY_JOIN_REQUESTED'
  | 'PROFILE_UPDATED'
  | 'MEDIA_UPLOADED'
  | 'PLAYER_LOGGED_IN'
  | 'STATUS_MODIFIED'
  | 'BROADCAST_SENT'
  | 'TOURNAMENT_ORGANIZER_REQUESTED'
  | 'SCRIM_ORGANIZER_REQUESTED'
  | 'ORGANIZER_PERMISSION_GRANTED'
  | 'ORGANIZER_PERMISSION_REJECTED'
  | 'TOURNAMENT_UPDATED'
  | 'SCRIM_UPDATED';

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

/**
 * Record an audit log event directly into the PostgreSQL database.
 */
export async function recordAuditLog(
  action: AuditAction,
  actor: string,
  details: string,
  target?: string,
  severity: AuditSeverity = 'INFO',
  ipAddress: string = '127.0.0.1'
): Promise<AuditLogItem> {
  const timestamp = new Date();

  try {
    const created = await prisma.auditLog.create({
      data: {
        action,
        severity,
        actor,
        target: target || null,
        details,
        ipAddress: ipAddress || null,
      },
    });

    return {
      id: created.id,
      action: created.action as AuditAction,
      severity: (created.severity || 'INFO') as AuditSeverity,
      actor: created.actor,
      target: created.target || undefined,
      details: created.details,
      ipAddress: created.ipAddress || undefined,
      timestamp: created.createdAt.toISOString(),
    };
  } catch (err) {
    console.error('[AUDIT LOG] Database persistence error:', err);
    return {
      id: `log-${Date.now()}`,
      action,
      severity,
      actor,
      target,
      details,
      ipAddress,
      timestamp: timestamp.toISOString(),
    };
  }
}

/**
 * Fetch latest audit logs from PostgreSQL database.
 */
async function fetchAuditLogsFromDb(): Promise<AuditLogItem[]> {
  try {
    const dbLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

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
  } catch (err) {
    console.error('[AUDIT LOG] Error querying audit logs from DB:', err);
    return [];
  }
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  const getCached = unstable_cache(
    fetchAuditLogsFromDb,
    ['db-audit-logs-list'],
    { revalidate: 15, tags: ['audit-logs'] }
  );
  return getCached();
}
