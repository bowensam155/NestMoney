// ============================================================
// NestMoney — RDS Postgres Client (Lambda Layer)
// Provider: AWS RDS db.t3.micro (free tier)
//
// This file is bundled into the Lambda Layer and shared across
// all Lambda functions. Connection pool is reused across warm
// invocations (module-level singleton per Lambda instance).
//
// Free-tier connection math:
//   db.t3.micro max_connections ≈ 60–80
//   Lambda concurrency limit (dev): set reserved concurrency to 10
//   max: 1 per instance × 10 instances = 10 connections max
//   Leaves headroom for RDS internal processes and future growth.
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

    // 1 connection per Lambda instance — Lambda instances are single-threaded.
    // Aggregate pool across concurrent instances stays well under RDS free-tier limit.
    max: 1,

    // Release idle connections promptly — Lambda instances can sit warm for minutes
    idleTimeoutMillis: 30_000,

    // Fail fast if RDS is unreachable (misconfigured VPC, wrong SG, etc.)
    connectionTimeoutMillis: 3_000,

    // SSL required for RDS in AWS; disabled for local Docker Postgres
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
