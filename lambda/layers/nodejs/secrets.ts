// ============================================================
// NestMoney — AWS Secrets Manager Helper
// All third-party API keys retrieved from Secrets Manager at Lambda cold start.
// Never use environment variables for secrets in production.
// See DEVELOPMENT.md Section 10.
// ============================================================

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION ?? 'us-west-2' });

const cache = new Map<string, string>();

export async function getSecret(secretName: string): Promise<string> {
  if (cache.has(secretName)) {
    return cache.get(secretName)!;
  }

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );

  const value = response.SecretString;
  if (!value) throw new Error(`Secret ${secretName} has no string value`);

  cache.set(secretName, value);
  return value;
}

export async function getSecretJson<T>(secretName: string): Promise<T> {
  const raw = await getSecret(secretName);
  return JSON.parse(raw) as T;
}
