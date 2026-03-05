// ============================================================
// NestMoney — Database Row Types
// Mirrors database/migrations/001_initial_schema.sql
// These are plain TypeScript types — no Supabase dependency.
// ============================================================

export type UserRole = 'primary_parent' | 'secondary_parent' | 'child' | 'contributor';
export type CardStatus = 'active' | 'frozen' | 'cancelled';
export type TransactionStatus = 'pending' | 'cleared' | 'declined' | 'needs_approval';
export type ApprovalStatus = 'pending' | 'approved' | 'denied';

export type CategoryLimits = Record<string, number>; // category -> cents

// ============================================================
// Row types — one per database table
// ============================================================

export interface FamilyRow {
  id: string;
  name: string;
  created_at: string;
}

export interface UserRow {
  id: string;              // Cognito sub
  family_id: string | null;
  role: UserRole;
  display_name: string | null;
  language_code: string;
  avatar_url: string | null;
  push_token: string | null;
  created_at: string;
}

export interface CardRow {
  id: string;
  family_id: string;
  child_user_id: string;
  unit_card_id: string | null;
  status: CardStatus;
  daily_limit: number | null;          // cents
  category_limits: CategoryLimits | null;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  family_id: string;
  card_id: string | null;
  user_id: string | null;
  amount: number;                      // cents
  currency: string;
  merchant_name: string | null;
  category: string | null;
  status: TransactionStatus | null;
  unit_transaction_id: string | null;
  created_at: string;
}

export interface ApprovalRequestRow {
  id: string;
  transaction_id: string;
  requested_by: string | null;
  approved_by: string | null;
  status: ApprovalStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface SavingsGoalRow {
  id: string;
  family_id: string;
  title: string;
  target_amount: number;               // cents
  current_amount: number;              // cents
  currency: string;
  owner_user_id: string | null;
  visible_to_contributors: boolean;
  deadline: string | null;             // ISO date string
  completed_at: string | null;
  created_at: string;
}

export interface GoalContributionRow {
  id: string;
  goal_id: string;
  contributed_by: string | null;
  amount: number;                      // cents, always positive
  created_at: string;
}

export interface EducationVideoRow {
  id: string;
  trigger_event: string;
  language_code: string;
  s3_key: string;
  cloudfront_url: string;
  heygen_video_id: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface VideoViewRow {
  id: string;
  user_id: string;
  video_id: string;
  watched_at: string;
  completed: boolean;
}

// ============================================================
// Insert types — omit auto-generated fields
// ============================================================

export type FamilyInsert = Omit<FamilyRow, 'id' | 'created_at'> & { id?: string };
export type UserInsert = Omit<UserRow, 'created_at'> & { created_at?: string };
export type CardInsert = Omit<CardRow, 'id' | 'created_at'> & { id?: string; status?: CardStatus };
export type TransactionInsert = Omit<TransactionRow, 'id' | 'created_at'> & { id?: string };
export type ApprovalRequestInsert = Omit<ApprovalRequestRow, 'id' | 'created_at'> & { id?: string; status?: ApprovalStatus };
export type SavingsGoalInsert = Omit<SavingsGoalRow, 'id' | 'created_at' | 'current_amount'> & { id?: string; current_amount?: number };
export type GoalContributionInsert = Omit<GoalContributionRow, 'id' | 'created_at'> & { id?: string };
export type EducationVideoInsert = Omit<EducationVideoRow, 'id' | 'created_at'> & { id?: string };
export type VideoViewInsert = Omit<VideoViewRow, 'id' | 'watched_at'> & { id?: string };

// ============================================================
// Update types — all fields optional
// ============================================================

export type FamilyUpdate = Partial<FamilyRow>;
export type UserUpdate = Partial<UserRow>;
export type CardUpdate = Partial<CardRow>;
export type SavingsGoalUpdate = Partial<SavingsGoalRow>;
export type ApprovalRequestUpdate = Partial<ApprovalRequestRow>;
export type VideoViewUpdate = Partial<VideoViewRow>;

// ============================================================
// Video trigger events — must match education_videos.trigger_event
// ============================================================

export const TRIGGER_EVENTS = [
  'first_paycheck',
  'card_declined',
  'credit_score_change',
  'first_savings_goal',
  'overdraft_fee',
  'tax_season',
] as const;

export type TriggerEvent = (typeof TRIGGER_EVENTS)[number];
