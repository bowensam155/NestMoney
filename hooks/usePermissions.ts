import { useAuthStore, selectUserRole } from '@/store/authStore';
import type { UserRole } from '@/types/database';

export function usePermissions() {
  const userRole = useAuthStore(selectUserRole);

  const isRole = (...roles: UserRole[]) => userRole !== null && roles.includes(userRole);

  return {
    userRole,
    canViewAllTransactions: () => isRole('primary_parent', 'secondary_parent'),
    canViewBalance: () => isRole('primary_parent', 'secondary_parent'),
    canManageCards: () => isRole('primary_parent', 'secondary_parent'),
    canApproveTransactions: () => isRole('primary_parent', 'secondary_parent'),
    canViewGoals: () => userRole !== null,
    canCreateGoals: () => isRole('primary_parent', 'secondary_parent'),
    canContributeToGoals: () => userRole !== null,
    isContributor: () => isRole('contributor'),
    isParent: () => isRole('primary_parent', 'secondary_parent'),
    isChild: () => isRole('child'),
  };
}
