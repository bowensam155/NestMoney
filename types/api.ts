// ============================================================
// NestMoney — API Gateway Request / Response Types
// All requests go through lib/api.ts (Axios + Cognito JWT).
// Lambda functions return these shapes.
// ============================================================

import type {
  FamilyRow,
  UserRow,
  UserRole,
  CardRow,
  TransactionRow,
  ApprovalRequestRow,
  SavingsGoalRow,
  GoalContributionRow,
  EducationVideoRow,
} from './database';

// ============================================================
// Shared envelope — every Lambda response is wrapped in this
// ============================================================

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code?: string;
}

// ============================================================
// Auth endpoints
// ============================================================

export interface InitiateOtpRequest {
  phone: string;
}

export interface InitiateOtpResponse {
  session: string; // Cognito session token for OTP confirmation
}

export interface ConfirmOtpRequest {
  phone: string;
  code: string;
  session: string;
}

export interface ConfirmOtpResponse {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

// ============================================================
// Family endpoints
// ============================================================

export interface GetFamilyResponse {
  family: FamilyRow;
  members: UserRow[];
  currentUser: UserRow;
}

export interface InviteMemberRequest {
  role: Extract<UserRole, 'secondary_parent' | 'contributor'>;
  goalId?: string; // Required when role = 'contributor'
}

export interface InviteMemberResponse {
  inviteLink: string; // Signed JWT link, 7-day expiry
  expiresAt: string;
}

export interface UpdateVisibilityRequest {
  memberId: string;
  canViewBalances: boolean;
  canViewTransactions: boolean;
}

export interface UpdateVisibilityResponse {
  member: UserRow;
}

// ============================================================
// Card endpoints
// ============================================================

export interface IssueCardRequest {
  childUserId: string;
  dailyLimit: number; // cents
}

export interface IssueCardResponse {
  card: CardRow;
}

export interface CardActionRequest {
  action: 'freeze' | 'unfreeze' | 'update_limit' | 'update_category_limits';
  cardId: string;
  dailyLimit?: number;
  categoryLimits?: Record<string, number>; // cents per category
}

export interface CardActionResponse {
  card: CardRow;
}

export interface ApproveTransactionRequest {
  transactionId: string;
  decision: 'approved' | 'denied';
}

export interface ApproveTransactionResponse {
  approvalRequest: ApprovalRequestRow;
  transaction: TransactionRow;
}

// ============================================================
// Goal endpoints
// ============================================================

export interface CreateGoalRequest {
  title: string;
  targetAmount: number; // cents
  currency?: string;
  deadline?: string;    // ISO date string
  visibleToContributors?: boolean;
}

export interface CreateGoalResponse {
  goal: SavingsGoalRow;
}

export interface ContributeToGoalRequest {
  goalId: string;
  amount: number; // cents
}

export interface ContributeToGoalResponse {
  contribution: GoalContributionRow;
  goal: SavingsGoalRow;
}

export interface GetGoalsResponse {
  goals: SavingsGoalRow[];
}

// ============================================================
// AI endpoints
// ============================================================

export type ExplainType = 'transaction' | 'term' | 'health';

export interface ExplainRequest {
  context: string;
  language: string;
  type: ExplainType;
}

export interface ExplainResponse {
  explanation: string;
  disclaimer: string;
}

export interface HealthScoreRequest {
  familyId: string;
}

export interface HealthScoreResponse {
  score: number;          // 0–100
  narrative: string;
  language: string;
}

// ============================================================
// Video endpoints
// ============================================================

export interface TriggerVideoRequest {
  triggerEvent: string;
  language: string;
}

export interface TriggerVideoResponse {
  video: EducationVideoRow;
  fromCache: boolean;
}

// ============================================================
// WebSocket message shapes
// ============================================================

export type WebSocketMessageType =
  | 'transaction_update'
  | 'approval_request'
  | 'goal_update'
  | 'video_ready';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
  timestamp: string;
}

export interface TransactionUpdatePayload {
  transaction: TransactionRow;
  requiresApproval: boolean;
}

export interface ApprovalRequestPayload {
  approvalRequest: ApprovalRequestRow;
  transaction: TransactionRow;
}
