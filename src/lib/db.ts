import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let connectionPool: sql.ConnectionPool | null = null;

export async function getConnection() {
  if (connectionPool) {
    return connectionPool;
  }
  connectionPool = await sql.connect(config);
  return connectionPool;
}

export { sql }; 