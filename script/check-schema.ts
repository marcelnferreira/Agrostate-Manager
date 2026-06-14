// AI_GENERATED_CODE_START
// Descrição: Script para verificar o schema do banco de dados e diagnosticar problemas de colunas
// Gerado por: Cursor AI
// Versão: Node.js, drizzle-orm ^0.39.3
import "dotenv/config";
// AI_GENERATED_CODE_END

import { db } from "../server/db";
import pg from "pg";

async function checkSchema() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Verificando estrutura da tabela 'users'...\n");
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log("Colunas encontradas na tabela 'users':");
    console.log("=====================================");
    result.rows.forEach((row: any) => {
      console.log(`- ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });

    // Verificar especificamente se full_name existe
    const fullNameColumn = result.rows.find((row: any) => 
      row.column_name === 'full_name' || row.column_name === 'fullName'
    );

    console.log("\n=====================================");
    if (fullNameColumn) {
      console.log(`✓ Coluna encontrada: ${fullNameColumn.column_name}`);
      if (fullNameColumn.column_name !== 'full_name') {
        console.log(`⚠ ATENÇÃO: A coluna está nomeada como '${fullNameColumn.column_name}' mas o schema espera 'full_name'`);
        console.log("  Solução: Execute 'npm run db:push' para sincronizar o schema.");
      } else {
        console.log("✓ Nome da coluna está correto!");
      }
    } else {
      console.log("✗ Coluna 'full_name' NÃO encontrada!");
      console.log("  Solução: Execute 'npm run db:push' para criar a coluna.");
    }

    // Testar uma query simples
    console.log("\n=====================================");
    console.log("Testando query com Drizzle ORM...");
    try {
      const { users } = await import("../shared/schema");
      const userList = await db.select().from(users).limit(1);
      console.log("✓ Query Drizzle funcionou corretamente!");
      if (userList.length > 0) {
        console.log(`  Exemplo de dados: ${JSON.stringify(userList[0], null, 2)}`);
      }
    } catch (error: any) {
      console.log("✗ Erro na query Drizzle:");
      console.log(`  ${error.message}`);
    }

  } catch (error: any) {
    console.error("Erro ao verificar schema:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkSchema();

