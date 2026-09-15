import { AuditLog } from '../../types/admin';
import { list } from '../api';
export const adminAuditService = { getLogs: () => list<AuditLog>('audit') };
