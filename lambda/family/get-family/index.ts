import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';
import type { FamilyRow, UserRow } from '../../../types/database';

interface GetFamilyResponse {
  family: FamilyRow;
  members: UserRow[];
  currentUser: UserRow;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // User ID always comes from validated Cognito JWT — never from request body
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    // TODO: Query Aurora for user's family
    // const db = await getDbClient();
    // const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    // const family = await db.query('SELECT * FROM families WHERE id = $1', [user.family_id]);
    // const members = await db.query('SELECT * FROM users WHERE family_id = $1', [user.family_id]);
    // await validateFamilyAccess(userId, user.family_id);

    const response: GetFamilyResponse = {
      family: { id: '', name: '', created_at: '' },
      members: [],
      currentUser: { id: userId, family_id: null, role: 'primary_parent', display_name: null, language_code: 'en', avatar_url: null, push_token: null, created_at: '' },
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
      body: JSON.stringify({ error: 'Failed to get family' }),
    };
  }
};
