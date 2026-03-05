import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';
import type { SavingsGoalRow } from '../../../types/database';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // TODO: Get user's family_id and role from Aurora
    // await validateFamilyAccess(userId, familyId);
    // TODO: If role = 'contributor': only return goals where visible_to_contributors = true
    // TODO: If role = 'child': only return goals where owner_user_id = userId
    // TODO: If role = 'parent': return all family goals

    const goals: SavingsGoalRow[] = [];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { goals } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get goals' }),
    };
  }
};
