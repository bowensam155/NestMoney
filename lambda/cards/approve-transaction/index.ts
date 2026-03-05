import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateFamilyAccess } from '../../middleware/permissions';

interface ApproveTransactionBody {
  transactionId: string;
  decision: 'approved' | 'denied';
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as ApproveTransactionBody;

    // TODO: Validate user is parent in the transaction's family
    // await validateFamilyAccess(userId, familyId, ['primary_parent', 'secondary_parent']);
    // TODO: Update approval_requests row in Aurora (approved_by = userId, status = decision)
    // TODO: If approved: call Unit.co to authorize the transaction
    // TODO: Push WebSocket event to parent's connection

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { approvalRequest: null, transaction: null } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Approval failed' }),
    };
  }
};
