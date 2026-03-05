// ============================================================
// NestMoney — Aurora PostgreSQL Client
// Shared across all Lambda functions via the Lambda Layer.
// Connection is reused across warm invocations.
// ============================================================

import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 1,             // Lambda: 1 connection per function instance
    idleTimeoutMillis: 120000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.DB_HOST?.includes('rds.amazonaws.com')
      ? { rejectUnauthorized: true }
      : false,
  });

  return pool;
}

export async function getDbClient(): Promise<PoolClient> {
  return getPool().connect();
}

export async function query<T extends object = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getDbClient();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}
