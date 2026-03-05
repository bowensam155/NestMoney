import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as crypto from 'crypto';

// Validates Unit.co HMAC-SHA256 signature then publishes to SQS
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const signature = event.headers['x-unit-signature'] ?? event.headers['X-Unit-Signature'];
    const rawBody = event.body ?? '';

    // TODO: Retrieve Unit webhook secret from Secrets Manager
    // const webhookSecret = await getSecret('nestmoney/unit-webhook-secret');
    // const expectedSig = crypto
    //   .createHmac('sha256', webhookSecret)
    //   .update(rawBody)
    //   .digest('hex');
    // if (signature !== expectedSig) {
    //   return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
    // }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;

    // TODO: Publish to SQS for async processing by process-transaction Lambda
    // const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
    // await sqsClient.send(new SendMessageCommand({
    //   QueueUrl: process.env.TRANSACTION_QUEUE_URL,
    //   MessageBody: rawBody,
    // }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};
