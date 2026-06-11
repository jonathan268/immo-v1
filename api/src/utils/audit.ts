import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

interface AuditEntry {
  userId?: string;
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  details?: string;
  ipAddress?: string;
}

export const createAuditLog = async (entry: AuditEntry): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: entry.userId,
        action: entry.action,
        target_id: entry.targetId,
        target_type: entry.targetType,
        details: entry.details,
        ip_address: entry.ipAddress,
      },
    });
  } catch {
    console.error("Failed to create audit log:", entry);
  }
};
