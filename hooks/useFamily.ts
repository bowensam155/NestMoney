import { useState, useEffect } from 'react';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import { get } from '@/lib/api';
import type { GetFamilyResponse } from '@/types/api';

export function useFamily() {
  const { family, members, setFamily } = useFamilyStore();
  const { cognitoUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cognitoUser) {
      void loadFamily();
    }
  }, [cognitoUser?.id]);

  const loadFamily = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await get<GetFamilyResponse>('/family');
      setFamily(response.family, response.members);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    family,
    familyId: family?.id ?? null,
    members,
    isLoading,
    error,
    refreshFamily: loadFamily,
  };
}
