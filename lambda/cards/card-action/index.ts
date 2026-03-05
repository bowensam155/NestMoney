import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';
import type { CardRow } from '../../../types/database';

type CardAction = 'freeze' | 'unfreeze' | 'update_limit' | 'update_category_limits';

interface CardActionBody {
  action: CardAction;
  cardId: string;
  dailyLimit?: number;
  categoryLimits?: Record<string, number>;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as CardActionBody;

    // TODO: Validate user is parent and owns card's family
    // await validateFamilyAccess(userId, familyId, ['primary_parent', 'secondary_parent']);
    // TODO: Call Unit.co API (PATCH /cards/{unit_card_id})
    // TODO: Update cards table in Aurora

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { card: null } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Card action failed' }),
    };
  }
};
