import { store } from '../db/store';
import { AuditLog, SafeUser, UserRole } from '../types';

export class AuditService {
  static log(params: {
    user: SafeUser | { id: string; name: string; role: UserRole };
    action: string;
    module: 'AUTH' | 'COMPLAINT' | 'USER' | 'REGION' | 'ANNOUNCEMENT' | 'EVENT' | 'CATEGORY' | 'SYSTEM';
    recordId?: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
  }): AuditLog {
    return store.createAuditLog({
      user_id: params.user.id,
      user_name: params.user.name,
      user_role: params.user.role,
      action: params.action,
      module: params.module,
      record_id: params.recordId,
      old_value: params.oldValue,
      new_value: params.newValue,
      ip_address: params.ipAddress || '127.0.0.1',
      user_agent: params.userAgent || 'SIWARGA Web Client',
    });
  }
}
