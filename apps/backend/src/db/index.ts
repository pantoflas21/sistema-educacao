import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL;
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

try {
  if (url) {
    pool = new Pool({ connectionString: url });
    db = drizzle(pool);
    console.log("[db] Connected to PostgreSQL");
  } else {
    console.warn("[db] DATABASE_URL not set. Running in memory-only mode.");
  }
} catch (e) {
  console.error("[db] Failed to init DB", e);
}

export { db, pool };