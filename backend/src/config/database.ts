import { Pool} from "pg";


const databaseUri = process.env.DATABASE_URI;

if (!databaseUri) {
  throw new Error("DATABASE_URI is missing from .env");
}

 export const pool = new Pool({
    connectionString: databaseUri,
    ssl:{
        rejectUnauthorized:false,
    },
     max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});



