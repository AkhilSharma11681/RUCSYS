// RUCSYS TypeScript Types & Enums
// Source of truth: docs/03-database-schema.md

export enum CollectionType {
  CAN_BE_STORED = 'can_be_stored',
  IMMEDIATE = 'immediate',
}

export enum RequestStatus {
  PENDING = 'pending',
  ARRIVED = 'arrived',
  READY_FOR_PICKUP = 'ready_for_pickup',
  COLLECTED = 'collected',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum EscalationStage {
  REMINDER = 'reminder',
  NOTIFICATION = 'notification',
  CALL = 'call',
  DEADLINE_PASSED = 'deadline_passed',
}

export enum Platform {
  AMAZON = 'Amazon',
  FLIPKART = 'Flipkart',
  MYNTRA = 'Myntra',
  MEESHO = 'Meesho',
  ZEPTO = 'Zepto',
  BLINKIT = 'Blinkit',
  BLUEDART = 'BlueDart',
  DELHIVERY = 'Delhivery',
  OTHER = 'Other',
}

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  hostel_room: string | null;
  created_at: string;
}

export interface Guard {
  id: string;
  full_name: string;
  email: string;
  gate_number: string;
  created_at: string;
}

export interface ParcelRequest {
  id: string;
  student_id: string;
  platform: Platform | string;
  order_last4: string;
  expected_date: string;
  collection_type: CollectionType;
  status: RequestStatus;
  created_at: string;
  // Joined fields
  student?: Student;
}

export interface Parcel {
  id: string;
  request_id: string | null;
  guard_id: string;
  parcel_number: number;
  storage_location: string | null;
  is_unregistered: boolean;
  arrived_at: string;
  notes: string | null;
  otp_code: string | null;
  otp_generated_at: string | null;
  otp_attempts: number;
  collected_at: string | null;
  collected_by_note: string | null;
  created_at: string;
  // Joined fields
  request?: ParcelRequest | null;
  guard?: Guard;
}

export interface EscalationLog {
  id: string;
  parcel_id: string;
  stage: EscalationStage;
  triggered_at: string;
}

export interface CapacityConfig {
  id: number;
  max_capacity: number;
  pause_new_requests_at_pct: number;
  reminder_after_days: number;
  notify_after_days: number;
  call_after_days: number;
  deadline_after_days: number;
  updated_at: string;
}

export interface UserRole {
  id: string;
  email: string;
  role: 'student' | 'guard' | 'admin';
}
