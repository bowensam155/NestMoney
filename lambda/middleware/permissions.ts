// ============================================================
// NestMoney — Lambda Permission Middleware
// Enforced on every Lambda function that returns sensitive data.
// The user ID always comes from the validated Cognito JWT.
// Never trust client-supplied IDs — they come from the JWT only.
// ============================================================

import { queryOne } from '../../lib/db';
import type { UserRole } from '../../types/database';

export class ForbiddenError extends Error {
  readonly statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

interface UserRoleRow {
  role: UserRole;
}

/**
 * Validates that a user belongs to a family and optionally holds one of the required roles.
 * Always call this before querying any sensitive family data.
 *
 * Queries RDS directly — uses the shared pg pool from lib/db.ts.
 * One DB round-trip per protected Lambda invocation.
 *
 * @param userId - Cognito sub from validated JWT
 * @param familyId - Family ID from the request path/body (not blindly trusted — validated against DB)
 * @param requiredRoles - Optional. If provided, user must hold one of these roles.
 * @returns The user's current role in this family.
 */
export const validateFamilyAccess = async (
  userId: string,
  familyId: string,
  requiredRoles?: UserRole[]
): Promise<UserRole> => {
  const row = await queryOne<UserRoleRow>(
    'SELECT role FROM users WHERE id = $1 AND family_id = $2',
    [userId, familyId]
  );

  if (!row) {
    throw new ForbiddenError('Not a member of this family');
  }

  if (requiredRoles && !requiredRoles.includes(row.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  return row.role;
};

/**
 * Extracts and validates the Cognito user ID from API Gateway's JWT authorizer context.
 * Throws UnauthorizedError if not present.
 */
export const extractUserId = (
  authorizer: Record<string, unknown> | null | undefined
): string => {
  const claims = authorizer?.claims as Record<string, unknown> | undefined;
  const sub = claims?.sub ?? authorizer?.sub;
  if (typeof sub !== 'string' || !sub) {
    throw new UnauthorizedError('Missing or invalid JWT');
  }
  return sub;
};

/**
 * Wraps a Lambda handler to automatically return 403/401 responses
 * for permission and auth errors.
 */
export function withPermissions<TEvent, TResult>(
  handler: (event: TEvent) => Promise<TResult>
) {
  return async (event: TEvent): Promise<TResult | { statusCode: number; body: string }> => {
    try {
      return await handler(event);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return { statusCode: 403, body: JSON.stringify({ error: error.message }) };
      }
      if (error instanceof UnauthorizedError) {
        return { statusCode: 401, body: JSON.stringify({ error: error.message }) };
      }
      throw error;
    }
  };
}
