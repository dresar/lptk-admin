import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Please provide a valid Neon PostgreSQL connection string in .env'
    );
  }

  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }

  return sqlClient;
}

export const db = {
  query: async <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]> => {
    const sql = getDb();
    const result = await sql(strings, ...values);
    return result as T[];
  },
  raw: async <T = any>(queryText: string, params: any[] = []): Promise<T[]> => {
    const sql = getDb();
    const result = await sql(queryText, params);
    return result as T[];
  },
};
