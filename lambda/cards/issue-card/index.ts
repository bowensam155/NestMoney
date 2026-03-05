import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';
import type { CardRow } from '../../../types/database';

interface IssueCardBody {
  childUserId: string;
  dailyLimit: number; // cents
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as IssueCardBody;

    // TODO: Validate user is parent
    // await validateFamilyAccess(userId, familyId, ['primary_parent', 'secondary_parent']);
    // TODO: Call Unit.co API to create virtual card
    //   const unitApiKey = await getSecret('nestmoney/unit-api-key');
    //   POST https://api.s.unit.co/cards { type: 'virtualDebitCard', ... }
    // TODO: Save card record to Aurora
    // TODO: Set daily limit via Unit API

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { card: null } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to issue card' }),
    };
  }
};
