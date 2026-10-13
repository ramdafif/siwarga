import fs from 'fs';
import path from 'path';
import {
  User,
  Region,
  RW,
  RT,
  ComplaintCategory,
  Complaint,
  ComplaintAttachment,
  ComplaintStatusHistory,
  ComplaintComment,
  ComplaintAssignment,
  Announcement,
  Event,
  EventParticipant,
  Notification,
  AuditLog,
  SystemConfig,
  ComplaintStatus,
  ComplaintPriority,
  UserRole,
} from '../types';
import {
  initialRegion,
  initialRWs,
  initialRTs,
  initialCategories,
  initialUsers,
  initialComplaints,
  initialAnnouncements,
  initialEvents,
  initialNotifications,
  initialAuditLogs,
  initialSystemConfig,
} from './seed';

interface DatabaseSchema {
  region: Region;
  rws: RW[];
  rts: RT[];
  categories: ComplaintCategory[];
  users: User[];
  complaints: Complaint[];
  announcements: Announcement[];
  events: Event[];
  eventParticipants: EventParticipant[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  systemConfig: SystemConfig;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'siwarga_db.json');

class DatabaseStore {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = this.getDefaultData();
    this.init();
  }

  private getDefaultData(): DatabaseSchema {
    return {
      region: initialRegion,
      rws: [...initialRWs],
      rts: [...initialRTs],
      categories: [...initialCategories],
      users: [...initialUsers],
      complaints: [...initialComplaints],
      announcements: [...initialAnnouncements],
      events: [...initialEvents],
      eventParticipants: [],
      notifications: [...initialNotifications],
      auditLogs: [...initialAuditLogs],
      systemConfig: { ...initialSystemConfig },
    };
  }

  private init() {
    if (this.isInitialized) return;
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        if (fileContent.trim()) {
          const parsed = JSON.parse(fileContent);
          this.data = {
            ...this.getDefaultData(),
            ...parsed,
          };
          this.isInitialized = true;
          return;
        }
      }

      // First time initialization
      this.persist();
      this.isInitialized = true;
    } catch (err) {
      console.warn('Database fallback to memory store:', err);
      this.data = this.getDefaultData();
      this.isInitialized = true;
    }
  }

  private persist() {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // USERS
  public getUsers(): User[] {
    return [...this.data.users];
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserByNik(nik: string): User | undefined {
    return this.data.users.find((u) => u.nik === nik);
  }

  public createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[index];
  }

  public deleteUser(id: string): boolean {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.data.users[index].status = 'SUSPENDED';
    this.persist();
    return true;
  }

  // REGIONS, RW, RT
  public getRegion(): Region {
    return { ...this.data.region };
  }

  public getRWs(): RW[] {
    return [...this.data.rws];
  }

  public getRWById(id: string): RW | undefined {
    return this.data.rws.find((r) => r.id === id);
  }

  public createRW(rw: Omit<RW, 'id' | 'created_at'>): RW {
    const newRW: RW = {
      ...rw,
      id: `rw-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.data.rws.push(newRW);
    this.persist();
    return newRW;
  }

  public getRTs(rwId?: string): RT[] {
    if (rwId) {
      return this.data.rts.filter((r) => r.rw_id === rwId);
    }
    return [...this.data.rts];
  }

  public getRTById(id: string): RT | undefined {
    return this.data.rts.find((r) => r.id === id);
  }

  public createRT(rt: Omit<RT, 'id' | 'created_at'>): RT {
    const newRT: RT = {
      ...rt,
      id: `rt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.data.rts.push(newRT);
    this.persist();
    return newRT;
  }

  // CATEGORIES
  public getCategories(onlyActive = true): ComplaintCategory[] {
    if (onlyActive) {
      return this.data.categories.filter((c) => c.is_active);
    }
    return [...this.data.categories];
  }

  public getCategoryById(id: string): ComplaintCategory | undefined {
    return this.data.categories.find((c) => c.id === id);
  }

  public createCategory(cat: Omit<ComplaintCategory, 'id' | 'created_at'>): ComplaintCategory {
    const newCat: ComplaintCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.data.categories.push(newCat);
    this.persist();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<ComplaintCategory>): ComplaintCategory | null {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.persist();
    return this.data.categories[idx];
  }

  // COMPLAINTS
  public getComplaints(filter?: {
    status?: ComplaintStatus;
    category_id?: string;
    priority?: ComplaintPriority;
    rw_id?: string;
    rt_id?: string;
    reporter_id?: string;
    assigned_to_role?: UserRole;
    assigned_to_user_id?: string;
    is_public?: boolean;
    keyword?: string;
  }): Complaint[] {
    let result = [...this.data.complaints];

    if (!filter) return result;

    if (filter.status) {
      result = result.filter((c) => c.status === filter.status);
    }
    if (filter.category_id) {
      result = result.filter((c) => c.category_id === filter.category_id);
    }
    if (filter.priority) {
      result = result.filter((c) => c.priority === filter.priority);
    }
    if (filter.rw_id) {
      result = result.filter((c) => c.rw_id === filter.rw_id);
    }
    if (filter.rt_id) {
      result = result.filter((c) => c.rt_id === filter.rt_id);
    }
    if (filter.reporter_id) {
      result = result.filter((c) => c.reporter_id === filter.reporter_id);
    }
    if (filter.is_public !== undefined) {
      result = result.filter((c) => c.is_public === filter.is_public);
    }
    if (filter.assigned_to_role) {
      result = result.filter(
        (c) => c.assignments && c.assignments.some((a) => a.assigned_to_role === filter.assigned_to_role)
      );
    }
    if (filter.assigned_to_user_id) {
      result = result.filter(
        (c) => c.assignments && c.assignments.some((a) => a.assigned_to_user_id === filter.assigned_to_user_id)
      );
    }
    if (filter.keyword) {
      const q = filter.keyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.ticket_number.toLowerCase().includes(q) ||
          c.address_location.toLowerCase().includes(q)
      );
    }

    // Sort descending by created_at
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getComplaintById(id: string): Complaint | undefined {
    return this.data.complaints.find((c) => c.id === id);
  }

  public createComplaint(
    complaintData: Omit<
      Complaint,
      'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'history' | 'comments' | 'assignments'
    >,
    initialHistoryNotes = 'Pengaduan dibuat oleh warga.'
  ): Complaint {
    const year = new Date().getFullYear();
    const count = this.data.complaints.length + 1;
    const ticketNumber = `PENG-${year}-${count.toString().padStart(3, '0')}`;

    const id = `cmp-${Date.now()}`;
    const now = new Date().toISOString();

    const initialHistory: ComplaintStatusHistory = {
      id: `his-${Date.now()}`,
      complaint_id: id,
      previous_status: null,
      new_status: complaintData.status || 'SUBMITTED',
      changed_by_user_id: complaintData.reporter_id,
      changed_by_user_name: complaintData.reporter_name || 'Warga',
      changed_by_role: 'WARGA',
      notes: initialHistoryNotes,
      created_at: now,
    };

    const newComplaint: Complaint = {
      ...complaintData,
      id,
      ticket_number: ticketNumber,
      history: [initialHistory],
      comments: [],
      assignments: [],
      created_at: now,
      updated_at: now,
    };

    this.data.complaints.unshift(newComplaint);
    this.persist();
    return newComplaint;
  }

  public updateComplaintStatus(
    id: string,
    newStatus: ComplaintStatus,
    changedByUser: { id: string; name: string; role: UserRole },
    notes: string
  ): Complaint | null {
    const idx = this.data.complaints.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const current = this.data.complaints[idx];
    const prevStatus = current.status;
    const now = new Date().toISOString();

    const historyEntry: ComplaintStatusHistory = {
      id: `his-${Date.now()}`,
      complaint_id: id,
      previous_status: prevStatus,
      new_status: newStatus,
      changed_by_user_id: changedByUser.id,
      changed_by_user_name: changedByUser.name,
      changed_by_role: changedByUser.role,
      notes,
      created_at: now,
    };

    const updatedComplaint: Complaint = {
      ...current,
      status: newStatus,
      updated_at: now,
      resolved_at: newStatus === 'RESOLVED' || newStatus === 'CLOSED' ? now : current.resolved_at,
      history: [...(current.history || []), historyEntry],
    };

    this.data.complaints[idx] = updatedComplaint;
    this.persist();
    return updatedComplaint;
  }

  public addComplaintComment(
    complaintId: string,
    user: { id: string; name: string; role: UserRole },
    content: string,
    isOfficial = false
  ): ComplaintComment | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    const newComment: ComplaintComment = {
      id: `com-${Date.now()}`,
      complaint_id: complaintId,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      content,
      is_official: isOfficial,
      created_at: new Date().toISOString(),
    };

    complaint.comments = [...(complaint.comments || []), newComment];
    complaint.updated_at = new Date().toISOString();
    this.persist();
    return newComment;
  }

  public assignComplaint(
    complaintId: string,
    assignedBy: { id: string; name: string },
    assignment: {
      assigned_to_role: UserRole;
      assigned_to_user_id?: string;
      assigned_to_user_name?: string;
      instructions: string;
    }
  ): ComplaintAssignment | null {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    const newAssignment: ComplaintAssignment = {
      id: `asn-${Date.now()}`,
      complaint_id: complaintId,
      assigned_to_role: assignment.assigned_to_role,
      assigned_to_user_id: assignment.assigned_to_user_id,
      assigned_to_user_name: assignment.assigned_to_user_name,
      assigned_by_user_id: assignedBy.id,
      assigned_by_user_name: assignedBy.name,
      instructions: assignment.instructions,
      assigned_at: new Date().toISOString(),
    };

    complaint.assignments = [...(complaint.assignments || []), newAssignment];
    complaint.status = 'ASSIGNED';
    complaint.updated_at = new Date().toISOString();
    this.persist();
    return newAssignment;
  }

  // ANNOUNCEMENTS
  public getAnnouncements(scope?: { rw_id?: string; rt_id?: string; audience?: string }): Announcement[] {
    let list = this.data.announcements.filter((a) => a.is_published);

    if (scope?.audience) {
      list = list.filter((a) => a.target_audience === 'ALL' || a.target_audience === scope.audience);
    }
    if (scope?.rw_id) {
      list = list.filter(
        (a) => a.target_audience === 'ALL' || a.rw_id === scope.rw_id || !a.rw_id
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getAnnouncementById(id: string): Announcement | undefined {
    return this.data.announcements.find((a) => a.id === id);
  }

  public createAnnouncement(ann: Omit<Announcement, 'id' | 'created_at'>): Announcement {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.data.announcements.unshift(newAnn);
    this.persist();
    return newAnn;
  }

  public deleteAnnouncement(id: string): boolean {
    const idx = this.data.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.data.announcements.splice(idx, 1);
    this.persist();
    return true;
  }

  // EVENTS
  public getEvents(rw_id?: string): Event[] {
    let list = [...this.data.events];
    if (rw_id) {
      list = list.filter((e) => !e.rw_id || e.rw_id === rw_id);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getEventById(id: string): Event | undefined {
    return this.data.events.find((e) => e.id === id);
  }

  public createEvent(evt: Omit<Event, 'id' | 'created_at' | 'registered_count'>): Event {
    const newEvt: Event = {
      ...evt,
      id: `evt-${Date.now()}`,
      registered_count: 0,
      created_at: new Date().toISOString(),
    };
    this.data.events.unshift(newEvt);
    this.persist();
    return newEvt;
  }

  public registerEventParticipant(
    eventId: string,
    user: { id: string; name: string; phone: string },
    notes?: string
  ): boolean {
    const event = this.getEventById(eventId);
    if (!event) return false;

    // Check if already registered
    const exists = this.data.eventParticipants.some(
      (p) => p.event_id === eventId && p.user_id === user.id
    );
    if (exists) return true;

    this.data.eventParticipants.push({
      id: `ep-${Date.now()}`,
      event_id: eventId,
      user_id: user.id,
      user_name: user.name,
      user_phone: user.phone,
      registered_at: new Date().toISOString(),
      notes,
    });

    event.registered_count = (event.registered_count || 0) + 1;
    this.persist();
    return true;
  }

  public isUserRegisteredForEvent(eventId: string, userId: string): boolean {
    return this.data.eventParticipants.some(
      (p) => p.event_id === eventId && p.user_id === userId
    );
  }

  // NOTIFICATIONS
  public getNotificationsByUser(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(notif: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (!n) return false;
    n.is_read = true;
    this.persist();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications
      .filter((n) => n.user_id === userId)
      .forEach((n) => {
        n.is_read = true;
      });
    this.persist();
  }

  // AUDIT LOGS
  public getAuditLogs(filter?: { module?: string; action?: string; userId?: string }): AuditLog[] {
    let list = [...this.data.auditLogs];
    if (filter?.module) {
      list = list.filter((l) => l.module === filter.module);
    }
    if (filter?.action) {
      list = list.filter((l) => l.action === filter.action);
    }
    if (filter?.userId) {
      list = list.filter((l) => l.user_id === filter.userId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 500 audit logs to prevent infinite expansion
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.persist();
    return newLog;
  }

  // SYSTEM CONFIG
  public getSystemConfig(): SystemConfig {
    return { ...this.data.systemConfig };
  }

  public updateSystemConfig(config: Partial<SystemConfig>): SystemConfig {
    this.data.systemConfig = {
      ...this.data.systemConfig,
      ...config,
    };
    this.persist();
    return this.data.systemConfig;
  }

  // METRICS & REPORTING
  public getGlobalStats() {
    const totalWarga = this.data.users.filter((u) => u.role === 'WARGA').length;
    const totalRT = this.data.rts.length;
    const totalRW = this.data.rws.length;
    const complaints = this.data.complaints;
    const totalComplaints = complaints.length;
    const newComplaints = complaints.filter(
      (c) => c.status === 'SUBMITTED' || c.status === 'VERIFICATION'
    ).length;
    const inProgressComplaints = complaints.filter(
      (c) => c.status === 'ACCEPTED' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS'
    ).length;
    const resolvedComplaints = complaints.filter(
      (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
    ).length;
    const urgentComplaints = complaints.filter((c) => c.priority === 'URGENT').length;

    // By category
    const byCategory: Record<string, number> = {};
    for (const cat of this.data.categories) {
      byCategory[cat.name] = 0;
    }
    for (const c of complaints) {
      const name = c.category_name || 'Lainnya';
      byCategory[name] = (byCategory[name] || 0) + 1;
    }

    // By status
    const byStatus: Record<string, number> = {};
    for (const c of complaints) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    }

    // By RW
    const byRW: Record<string, number> = {};
    for (const rw of this.data.rws) {
      byRW[`RW ${rw.number}`] = complaints.filter((c) => c.rw_id === rw.id).length;
    }

    return {
      totalWarga,
      totalRT,
      totalRW,
      totalComplaints,
      newComplaints,
      inProgressComplaints,
      resolvedComplaints,
      urgentComplaints,
      byCategory,
      byStatus,
      byRW,
    };
  }

  public getRWStats(rwId: string) {
    const rtsInRW = this.data.rts.filter((r) => r.rw_id === rwId);
    const wargaInRW = this.data.users.filter((u) => u.rw_id === rwId && u.role === 'WARGA');
    const complaints = this.data.complaints.filter((c) => c.rw_id === rwId);

    const byRT: Record<string, number> = {};
    for (const rt of rtsInRW) {
      byRT[`RT ${rt.number}`] = complaints.filter((c) => c.rt_id === rt.id).length;
    }

    const byCategory: Record<string, number> = {};
    for (const c of complaints) {
      const name = c.category_name || 'Lainnya';
      byCategory[name] = (byCategory[name] || 0) + 1;
    }

    return {
      totalWarga: wargaInRW.length,
      totalRT: rtsInRW.length,
      totalComplaints: complaints.length,
      newComplaints: complaints.filter(
        (c) => c.status === 'SUBMITTED' || c.status === 'VERIFICATION'
      ).length,
      inProgressComplaints: complaints.filter(
        (c) => c.status === 'ACCEPTED' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS'
      ).length,
      resolvedComplaints: complaints.filter(
        (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
      ).length,
      urgentComplaints: complaints.filter((c) => c.priority === 'URGENT').length,
      byRT,
      byCategory,
    };
  }

  public getRTStats(rtId: string) {
    const wargaInRT = this.data.users.filter((u) => u.rt_id === rtId && u.role === 'WARGA');
    const complaints = this.data.complaints.filter((c) => c.rt_id === rtId);

    return {
      totalWarga: wargaInRT.length,
      totalComplaints: complaints.length,
      newComplaints: complaints.filter((c) => c.status === 'SUBMITTED').length,
      activeComplaints: complaints.filter(
        (c) =>
          c.status === 'VERIFICATION' ||
          c.status === 'ACCEPTED' ||
          c.status === 'ASSIGNED' ||
          c.status === 'IN_PROGRESS' ||
          c.status === 'FORWARDED'
      ).length,
      resolvedComplaints: complaints.filter(
        (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
      ).length,
      urgentComplaints: complaints.filter((c) => c.priority === 'URGENT').length,
    };
  }

  public getWargaStats(userId: string) {
    const myComplaints = this.data.complaints.filter((c) => c.reporter_id === userId);
    return {
      totalComplaints: myComplaints.length,
      activeComplaints: myComplaints.filter(
        (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'REJECTED'
      ).length,
      resolvedComplaints: myComplaints.filter(
        (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
      ).length,
    };
  }
}

// Global Singleton to maintain hot instances across route handlers
const globalForStore = global as unknown as { storeInstance?: DatabaseStore };
export const store = globalForStore.storeInstance ?? new DatabaseStore();
if (process.env.NODE_ENV !== 'production') globalForStore.storeInstance = store;
