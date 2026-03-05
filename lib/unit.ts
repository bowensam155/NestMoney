// ============================================================
// NestMoney — Card Action Client
// All Unit.co calls go through Lambda (lambda/cards/).
// The Unit API key never touches the client.
// ============================================================

import { post } from './api';
import type { CardActionRequest, CardActionResponse } from '@/types/api';

export async function freezeCard(cardId: string): Promise<CardActionResponse> {
  return post<CardActionRequest, CardActionResponse>('/cards/action', {
    action: 'freeze',
    cardId,
  });
}

export async function unfreezeCard(cardId: string): Promise<CardActionResponse> {
  return post<CardActionRequest, CardActionResponse>('/cards/action', {
    action: 'unfreeze',
    cardId,
  });
}

export async function updateCardLimit(
  cardId: string,
  dailyLimit: number
): Promise<CardActionResponse> {
  return post<CardActionRequest, CardActionResponse>('/cards/action', {
    action: 'update_limit',
    cardId,
    dailyLimit,
  });
}
