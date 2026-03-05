import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';

interface CreateGoalBody {
  title: string;
  targetAmount: number; // cents
  currency?: string;
  deadline?: string;
  visibleToContributors?: boolean;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as CreateGoalBody;

    // TODO: Validate user is parent
    // await validateFamilyAccess(userId, familyId, ['primary_parent', 'secondary_parent']);
    // TODO: Insert into savings_goals table in Aurora
    // TODO: If first goal → invoke trigger-video Lambda async (event: 'first_savings_goal')

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { goal: null } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create goal' }),
    };
  }
};
