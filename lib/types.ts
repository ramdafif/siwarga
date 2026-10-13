export type UserRole = 'SUPER_ADMIN' | 'ADMIN_RW' | 'ADMIN_RT' | 'KARANG_TARUNA' | 'WARGA';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ComplaintStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFICATION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'NEED_MORE_INFORMATION'
  | 'FORWARDED'
  | 'CANCELLED';

export type TargetAudience = 'ALL' | 'RW' | 'RT' | 'KARANG_TARUNA';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type NotificationType =
  | 'COMPLAINT_STATUS'
  | 'COMPLAINT_COMMENT'
  | 'COMPLAINT_ASSIGNED'
  | 'ANNOUNCEMENT'
  | 'EVENT'
  | 'SYSTEM';

export interface User {
  id: string;
  nik: string; // Stored securely, masked on output for unprivileged users
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address: string;
  rw_id?: string;
  rt_id?: string;
  role: UserRole;
  status: UserStatus;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<User, 'password_hash'> & {
  masked_nik?: string;
  masked_phone?: string;
};

export interface Region {
  id: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
}

export interface RW {
  id: string;
  region_id: string;
  number: string; // e.g. "01"
  name: string; // e.g. "RW 01 Kelurahan Merdeka"
  leader_name: string;
  leader_phone: string;
  address: string;
  description?: string;
  created_at: string;
}

export interface RT {
  id: string;
  rw_id: string;
  number: string; // e.g. "01", "02"
  name: string; // e.g. "RT 01"
  leader_name: string;
  leader_phone: string;
  created_at: string;
}

export interface Citizen {
  id: string;
  user_id: string;
  nik: string;
  family_card_number: string;
  full_name: string;
  gender: 'L' | 'P';
  religion: string;
  occupation: string;
  rw_id: string;
  rt_id: string;
  phone: string;
  address: string;
  is_verified: boolean;
  created_at: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  sla_hours?: number;
  is_active: boolean;
  created_at: string;
}

export interface ComplaintAttachment {
  id: string;
  complaint_id: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'document';
  file_size: number;
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  previous_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_by_user_id: string;
  changed_by_user_name: string;
  changed_by_role: UserRole;
  notes: string;
  created_at: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  content: string;
  is_official: boolean;
  created_at: string;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  assigned_to_role: UserRole;
  assigned_to_user_id?: string;
  assigned_to_user_name?: string;
  assigned_by_user_id: string;
  assigned_by_user_name: string;
  instructions: string;
  assigned_at: string;
}

export interface Complaint {
  id: string;
  ticket_number: string; // e.g. "PENG-2026-001"
  title: string;
  description: string;
  category_id: string;
  category_name?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  reporter_id: string;
  reporter_name?: string;
  reporter_phone?: string;
  rw_id: string;
  rt_id: string;
  rw_number?: string;
  rt_number?: string;
  address_location: string;
  latitude?: number;
  longitude?: number;
  is_public: boolean;
  attachments?: ComplaintAttachment[];
  history?: ComplaintStatusHistory[];
  comments?: ComplaintComment[];
  assignments?: ComplaintAssignment[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  attachment_url?: string;
  target_audience: TargetAudience;
  rw_id?: string;
  rt_id?: string;
  rw_number?: string;
  rt_number?: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  publish_date: string;
  expired_date?: string;
  is_published: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  organizer: string;
  event_date: string;
  event_time: string;
  location: string;
  poster_url?: string;
  quota: number;
  registered_count: number;
  status: EventStatus;
  rw_id?: string;
  rt_id?: string;
  created_by_id: string;
  created_by_name: string;
  created_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  registered_at: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  reference_id?: string;
  reference_url?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string; // e.g. "CREATE_COMPLAINT", "UPDATE_STATUS", "USER_LOGIN"
  module: string; // "COMPLAINT", "USER", "ANNOUNCEMENT", "EVENT", "REGION", "AUTH"
  record_id?: string;
  old_value?: string;
  new_value?: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SystemConfig {
  app_name: string;
  subdistrict_name: string;
  city_name: string;
  contact_email: string;
  contact_phone: string;
  allow_citizen_registration: boolean;
  enable_auto_triage: boolean;
  maintenance_mode: boolean;
}

export type SystemSettings = SystemConfig;
