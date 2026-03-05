import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';
import type { UserRole } from '../../../types/database';

interface InviteMemberBody {
  role: Extract<UserRole, 'secondary_parent' | 'contributor'>;
  goalId?: string;
}

interface InviteMemberResponse {
  inviteLink: string;
  expiresAt: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as InviteMemberBody;

    // TODO: Validate user is primary_parent
    // await validateFamilyAccess(userId, familyId, ['primary_parent']);
    // TODO: Generate signed JWT invite link (7-day expiry)
    // TODO: Return invite link for WhatsApp/SMS sharing

    const response: InviteMemberResponse = {
      inviteLink: '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: response }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create invite' }),
    };
  }
};
