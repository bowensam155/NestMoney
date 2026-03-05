import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';
import type { UserRow } from '../../../types/database';

interface UpdateVisibilityBody {
  memberId: string;
  canViewBalances: boolean;
  canViewTransactions: boolean;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as UpdateVisibilityBody;

    // TODO: Validate requesting user is primary_parent
    // await validateFamilyAccess(userId, familyId, ['primary_parent']);
    // TODO: Update visibility settings in Aurora

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { memberId: body.memberId } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to update visibility' }),
    };
  }
};
