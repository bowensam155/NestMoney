import { useState, useEffect } from 'react';
import { get } from '@/lib/api';
import type { CardRow } from '@/types/database';

export function useCard(cardId?: string) {
  const [card, setCard] = useState<CardRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cardId) {
      void loadCard();
    }
  }, [cardId]);

  const loadCard = async () => {
    if (!cardId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await get<{ card: CardRow }>(`/cards/${cardId}`);
      setCard(response.card);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    card,
    isLoading,
    error,
    refreshCard: loadCard,
  };
}
