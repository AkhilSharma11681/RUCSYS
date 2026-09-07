import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, date } from 'drizzle-orm/pg-core';

// Enums
export const collectionTypeEnum = pgEnum('collection_type', ['can_be_stored', 'immediate']);
export const requestStatusEnum = pgEnum('request_status', [
  'pending',
  'arrived',
  'ready_for_pickup',
  'collected',
  'cancelled',
  'overdue',
]);
export const escalationStageEnum = pgEnum('escalation_stage', [
  'reminder',
  'notification',
  'call',
  'deadline_passed',
]);

// 1. Students
export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone'),
  hostelRoom: text('hostel_room'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Guards
export const guards = pgTable('guards', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  gateNumber: text('gate_number').default('Gate No. 2').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Parcel Requests
export const parcelRequests = pgTable('parcel_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  orderLast4: text('order_last4').notNull(),
  expectedDate: date('expected_date').notNull(),
  collectionType: collectionTypeEnum('collection_type').default('can_be_stored').notNull(),
  status: requestStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Parcels
export const parcels = pgTable('parcels', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestId: uuid('request_id')
    .references(() => parcelRequests.id, { onDelete: 'set null' })
    .unique(),
  guardId: uuid('guard_id')
    .notNull()
    .references(() => guards.id),
  parcelNumber: integer('parcel_number').notNull(),
  storageLocation: text('storage_location'),
  isUnregistered: boolean('is_unregistered').default(false).notNull(),
  arrivedAt: timestamp('arrived_at', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),

  otpCode: text('otp_code'),
  otpGeneratedAt: timestamp('otp_generated_at', { withTimezone: true }),
  otpAttempts: integer('otp_attempts').default(0).notNull(),

  collectedAt: timestamp('collected_at', { withTimezone: true }),
  collectedByNote: text('collected_by_note'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Escalation Log
export const escalationLog = pgTable('escalation_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  parcelId: uuid('parcel_id')
    .notNull()
    .references(() => parcels.id, { onDelete: 'cascade' }),
  stage: escalationStageEnum('stage').notNull(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
});

// 6. Capacity Config
export const capacityConfig = pgTable('capacity_config', {
  id: integer('id').primaryKey().default(1),
  maxCapacity: integer('max_capacity').default(100).notNull(),
  pauseNewRequestsAtPct: integer('pause_new_requests_at_pct').default(90).notNull(),
  reminderAfterDays: integer('reminder_after_days').default(3).notNull(),
  notifyAfterDays: integer('notify_after_days').default(5).notNull(),
  callAfterDays: integer('call_after_days').default(7).notNull(),
  deadlineAfterDays: integer('deadline_after_days').default(10).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
