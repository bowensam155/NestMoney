import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface HealthScoreResponse {
  score: number;     // 0-100
  narrative: string;
  language: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // TODO: Validate user is parent
    // await validateFamilyAccess(userId, familyId, ['primary_parent', 'secondary_parent']);

    // TODO: Aggregate last 30 days of transactions from Aurora
    // TODO: Build health score prompt with anonymised stats (no PII to Anthropic)
    // TODO: Call Anthropic API to generate narrative in user's language
    // TODO: Return score (0-100) + plain-language narrative

    const response: HealthScoreResponse = {
      score: 0,
      narrative: '',
      language: 'en',
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: response }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Health score failed' }),
    };
  }
};
