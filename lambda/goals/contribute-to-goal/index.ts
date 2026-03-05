import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';

interface ContributeBody {
  goalId: string;
  amount: number; // cents, always positive
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as ContributeBody;

    // TODO: Validate contributor role has access to this goal (visible_to_contributors = true)
    // await validateFamilyAccess(userId, familyId);
    // TODO: Insert into goal_contributions table
    // TODO: Update savings_goals.current_amount += amount
    // TODO: Push notification to goal owner via SNS

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { contribution: null, goal: null } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Contribution failed' }),
    };
  }
};
