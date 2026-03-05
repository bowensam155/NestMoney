// ============================================================
// NestMoney — AI Prompt Builders
// Used in Lambda functions only (lambda/ai/explain/, lambda/ai/health-score/).
// Kept in lib/ so they can be unit-tested from the frontend test suite.
// ============================================================

import type { ExplainType } from '@/types/api';

const BASE_INSTRUCTION = (language: string) =>
  `You are a financial educator helping immigrant families understand the US financial system. Respond in ${language}. Use simple, clear language appropriate for someone learning about personal finance. Never give specific financial advice — explain, don't advise. Keep your response under 150 tokens.`;

export function buildExplainPrompt(context: string, language: string, type: ExplainType): string {
  const base = BASE_INSTRUCTION(language);

  const prompts: Record<ExplainType, string> = {
    transaction: `${base}\n\nExplain this transaction in 2-3 sentences:\n${context}`,
    term: `${base}\n\nExplain this financial term:\n${context}`,
    health: `${base}\n\nProvide a brief, encouraging summary of this family's financial health:\n${context}`,
  };

  return prompts[type];
}

export const DISCLAIMER: Record<string, string> = {
  en: 'For educational purposes only, not financial advice.',
  es: 'Solo con fines educativos, no es asesoramiento financiero.',
  tl: 'Para sa layuning pang-edukasyon lamang, hindi payo sa pananalapi.',
  vi: 'Chỉ dành cho mục đích giáo dục, không phải lời khuyên tài chính.',
  yue: '僅供教育用途，並非財務建議。',
  zh: '仅供教育用途，并非财务建议。',
  mn: 'Зөвхөн боловсролын зорилгоор, санхүүгийн зөвлөгөө биш.',
  hi: 'केवल शैक्षिक उद्देश्यों के लिए, वित्तीय सलाह नहीं।',
  pa: 'ਸਿਰਫ਼ ਵਿੱਦਿਅਕ ਉਦੇਸ਼ਾਂ ਲਈ, ਵਿੱਤੀ ਸਲਾਹ ਨਹੀਂ।',
};
