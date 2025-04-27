import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Parse the connection string
const connectionString = new URL(process.env.DATABASE_URL);

export default {
  schema: './app/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: connectionString.hostname,
    port: parseInt(connectionString.port),
    user: connectionString.username,
    password: connectionString.password,
    database: connectionString.pathname.slice(1), // Remove leading slash
  },
} satisfies Config;
