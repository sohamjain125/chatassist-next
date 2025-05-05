import sql from 'mssql';

const dbConfig = {
  user: process.env.DB_USER || "Soham",
  password: process.env.DB_PASSWORD || "Sohamjain@125",
  server: process.env.DB_SERVER || "soham",
  database: process.env.DB_NAME || "chat",
  options: { encrypt: true, trustServerCertificate: true }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
} 