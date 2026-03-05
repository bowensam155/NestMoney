// ============================================================
// NestMoney — RDS Postgres Client (Lambda-side only)
// Provider: AWS RDS Postgres, db.t3.micro (free tier)
//
// IMPORTANT: This file is imported by Lambda functions only.
// Never import this in app/, components/, hooks/, or store/.
// DB credentials are Lambda env vars — never bundled into the client.
//
// Free-tier constraints:
//   - db.t3.micro: max ~60–80 connections total
//   - Pool max: 5 — leaves headroom across concurrent Lambda instances
//   - Single AZ — no Multi-AZ on free tier
//   - 20 GB gp2 storage
//
// Connection is reused across warm Lambda invocations (module-level singleton).
// ============================================================

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Module-level singleton — survives across warm Lambda invocations
let _pool: Pool | null = null;

function getPool(): Pool {
  if (_pool) return _pool;

  _pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    // Free-tier RDS: keep total connections well under db.t3.micro limit.
    // With Lambda concurrency limited during development, max 5 is safe.
    max: 5,

    // Release idle connections quickly — Lambda instances can sit idle
    idleTimeoutMillis: 10_000,

    // Fail fast rather than queue — surface DB connectivity problems immediately
    connectionTimeoutMillis: 3_000,

    // SSL required for RDS in production; skipped for local Docker Postgres
    ssl: process.env.DB_HOST?.includes('rds.amazonaws.com')
      ? { rejectUnauthorized: true }
      : false,
  });

  _pool.on('error', (err: Error) => {
    // Log pool errors without crashing — Lambda will retry the invocation
    console.error('[db] Pool error:', err.message);
    _pool = null; // Force reconnect on next call
  });

  return _pool;
}

// ============================================================
// Typed query helper — returns typed rows
// ============================================================

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(sql, params);
}

// ============================================================
// Transaction helper — acquires a client for multi-statement
// transactions. Caller is responsible for COMMIT / ROLLBACK.
// ============================================================

export async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}

// ============================================================
// Convenience: run a single-row query and return the first row,
// or null if no rows found.
// ============================================================

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.rows[0] ?? null;
}

// ============================================================
// Convenience: run a query and return all rows.
// ============================================================

export async function queryMany<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await query<T>(sql, params);
  return result.rows;
}
