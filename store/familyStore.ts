// ============================================================
// NestMoney — Family Store (Zustand)
// Holds family membership data loaded from GET /family.
// ============================================================

import { create } from 'zustand';
import type { FamilyRow, UserRow } from '@/types/database';

interface FamilyState {
  family: FamilyRow | null;
  members: UserRow[];
  setFamily: (family: FamilyRow, members: UserRow[]) => void;
  addMember: (member: UserRow) => void;
  updateMember: (id: string, updates: Partial<UserRow>) => void;
  clearFamily: () => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  family: null,
  members: [],

  setFamily: (family, members) => set({ family, members }),

  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),

  updateMember: (id, updates) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  clearFamily: () => set({ family: null, members: [] }),
}));
