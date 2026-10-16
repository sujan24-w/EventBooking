import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
async function startServer() {
  const { default: app } = await import("./app");
  const { pool } = await import("./config/database");

  try {
    console.log("URI loaded:", Boolean(process.env.DATABASE_URI));

    const result = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected:", result.rows[0]);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    await pool.end();
    process.exit(1);
  }
}

startServer(); 