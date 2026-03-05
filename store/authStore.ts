// ============================================================
// NestMoney — Auth Store (Zustand)
// Holds the Cognito session state.
// Tokens are stored in SecureStore (via lib/auth.ts), not here.
// This store holds the decoded user identity for UI use.
// ============================================================

import { create } from 'zustand';
import type { UserRow, UserRole } from '@/types/database';

export interface CognitoUser {
  id: string;          // Cognito sub — matches users.id in Aurora
  email?: string;
  phone?: string;
}

interface AuthState {
  /** Decoded identity from Cognito JWT. Null when not authenticated. */
  cognitoUser: CognitoUser | null;
  /** Full user profile from Aurora (fetched after login). */
  userProfile: UserRow | null;
  /** True while checking session at app start. */
  isLoading: boolean;

  setCognitoUser: (user: CognitoUser | null) => void;
  setUserProfile: (profile: UserRow | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  cognitoUser: null,
  userProfile: null,
  isLoading: true,

  setCognitoUser: (cognitoUser) => set({ cognitoUser }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => set({ cognitoUser: null, userProfile: null, isLoading: false }),
}));

// ============================================================
// Selectors
// ============================================================

export const selectUserRole = (state: AuthState): UserRole | null =>
  state.userProfile?.role ?? null;

export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.cognitoUser !== null;

export const selectDisplayName = (state: AuthState): string =>
  state.userProfile?.display_name ?? 'User';
