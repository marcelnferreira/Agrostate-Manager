// AI_GENERATED_CODE_START
// Descrição: Carregando variáveis de ambiente antes de qualquer verificação
// Gerado por: Cursor AI
// Versão: dotenv ^16.0.0
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega o .env do diretório raiz do projeto
config({ path: resolve(__dirname, "..", ".env") });
// AI_GENERATED_CODE_END

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
