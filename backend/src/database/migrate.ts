import dotenv from "dotenv";
import path from "node:path";
import { readFile } from "node:fs/promises";


dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

async function migrate() {
    const { pool } = await import("../config/database");
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = await readFile(schemaPath, "utf-8");

    await pool.query(schema);

    console.log("Database migration completed successfully.");
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate().catch((error: unknown) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
