import { Pool } from "pg";

const globalForPg = global as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://nikahyuk_user:NikahYuk_DB_Secr3t_2026_c5a0@127.0.0.1:5432/nikahyuk_db?schema=public",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
