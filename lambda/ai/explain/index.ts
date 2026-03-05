import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { ExplainType } from '../../../types/api';

interface ExplainBody {
  context: string;
  language: string;
  type: ExplainType;
}

// Max tokens for transaction explanations — see ARCHITECTURE.md Section 8
const MAX_TOKENS = 150;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub as string;
    if (!userId) {
      return { statusCode: 401, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = JSON.parse(event.body ?? '{}') as ExplainBody;

    // TODO: Get Anthropic API key from Secrets Manager
    // const anthropicApiKey = await getSecret('nestmoney/anthropic-api-key');

    // TODO: Build prompt from lib/ai/prompts.ts (no PII — only category + merchant name)
    // const prompt = buildExplainPrompt(body.context, body.language, body.type);

    // TODO: Call Anthropic Claude API
    // const response = await fetch('https://api.anthropic.com/v1/messages', {
    //   method: 'POST',
    //   headers: { 'x-api-key': anthropicApiKey, 'anthropic-version': '2023-06-01' },
    //   body: JSON.stringify({
    //     model: 'claude-3-haiku-20240307',
    //     max_tokens: MAX_TOKENS,
    //     messages: [{ role: 'user', content: prompt }],
    //   }),
    // });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          explanation: '',
          disclaimer: 'For educational purposes only, not financial advice.',
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Explanation failed' }),
    };
  }
};
