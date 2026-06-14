// AI_GENERATED_CODE_START
// Descrição: Carregando variáveis de ambiente antes de qualquer verificação
// Gerado por: Cursor AI
// Versão: dotenv ^16.0.0
import "dotenv/config";
// AI_GENERATED_CODE_END

import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
