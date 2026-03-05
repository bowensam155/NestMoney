import type { SQSEvent, SQSRecord } from 'aws-lambda';

interface UnitTransactionWebhook {
  type: string;
  data: {
    id: string;
    attributes: {
      amount: number;
      merchant?: { name: string; category: string };
      status: string;
      createdAt: string;
    };
    relationships?: {
      account?: { data: { id: string } };
      card?: { data: { id: string } };
    };
  };
}

// Consumes SQS queue → inserts to Aurora → pushes WebSocket event → triggers video if needed
export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    await processRecord(record);
  }
};

async function processRecord(record: SQSRecord): Promise<void> {
  const webhook = JSON.parse(record.body) as UnitTransactionWebhook;

  // TODO: Insert transaction into Aurora
  // const db = await getDbClient();
  // const transaction = await db.query(
  //   'INSERT INTO transactions (...) VALUES (...) RETURNING *',
  //   [...]
  // );

  // TODO: If over limit → insert approval_request, push WebSocket event to parent
  // TODO: If video trigger event → async invoke trigger-video Lambda

  // TODO: Push real-time WebSocket event to parent's active connection
  // const apiGw = new ApiGatewayManagementApiClient({ endpoint: process.env.WS_API_ENDPOINT });
  // await apiGw.send(new PostToConnectionCommand({ ConnectionId: parentConnectionId, Data: payload }));

  // TODO: Push SNS notification
  // const sns = new SNSClient({ region: process.env.AWS_REGION });
  // await sns.send(new PublishCommand({ TargetArn: user.push_token, Message: ... }));
}
