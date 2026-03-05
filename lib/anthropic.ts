// ============================================================
// NestMoney — AI Explainer Client
// All Anthropic API calls go through Lambda (lambda/ai/explain/).
// The Anthropic API key never touches the client.
// ============================================================

import { post } from './api';
import type { ExplainRequest, ExplainResponse, ExplainType } from '@/types/api';

export type { ExplainType };

export async function explainTransaction(
  context: string,
  language: string,
  type: ExplainType
): Promise<ExplainResponse> {
  return post<ExplainRequest, ExplainResponse>('/ai/explain', { context, language, type });
}
