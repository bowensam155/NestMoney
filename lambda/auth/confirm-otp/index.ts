import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface ConfirmOtpBody {
  phone: string;
  code: string;
  session: string;
}

interface ConfirmOtpResponse {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body ?? '{}') as ConfirmOtpBody;

    // TODO: Call Cognito RespondToAuthChallenge with SMS_MFA
    // const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
    // const command = new RespondToAuthChallengeCommand({ ... });
    // const result = await cognitoClient.send(command);

    const response: ConfirmOtpResponse = {
      accessToken: '',
      refreshToken: '',
      idToken: '',
      expiresIn: 3600,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: response }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'OTP confirmation failed' }),
    };
  }
};
