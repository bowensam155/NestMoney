// ============================================================
// NestMoney — Language Store (Zustand)
// Each user picks their own language — family members can differ.
// Synced to users.language_code in Aurora on change.
// ============================================================

import { create } from 'zustand';
import i18n from '@/i18n/config';

export type LanguageCode = 'en' | 'es' | 'tl' | 'vi' | 'yue' | 'zh' | 'mn' | 'hi' | 'pa';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',

  setLanguage: (language) => {
    void i18n.changeLanguage(language);
    set({ language });
  },
}));
