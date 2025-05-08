import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME || "",
  options: { encrypt: true, trustServerCertificate: true }
};

export async function getConnection() {
  try {
    console.log("dbConfig",dbConfig);
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
} 