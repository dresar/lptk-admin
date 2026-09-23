import { db } from '@/server/db/client';

export interface AuditLogPayload {
  userId?: string | null;
  actionCode: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  oldData?: any;
  newData?: any;
}

export async function recordAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    await db.query`
      INSERT INTO public.audit_logs (
        user_id,
        action_code,
        entity_type,
        entity_id,
        ip_address,
        user_agent,
        old_data,
        new_data
      ) VALUES (
        ${payload.userId || null},
        ${payload.actionCode},
        ${payload.entityType},
        ${payload.entityId || null},
        ${payload.ipAddress || null},
        ${payload.userAgent || null},
        ${payload.oldData ? JSON.stringify(payload.oldData) : null},
        ${payload.newData ? JSON.stringify(payload.newData) : null}
      );
    `;
  } catch (err) {
    // Non-blocking error logging for audit logs so core operations don't fail if audit table is undergoing maintenance
    console.error('Failed to write audit log:', err);
  }
}
