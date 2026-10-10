import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Either a single DB_URL (mysql://user:pass@host:3306/dbname — what PlanetScale/Railway/Aiven/Render give you)
// or the individual DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME variables.
const fromUrl = (() => {
  if (!process.env.DB_URL) return null;
  try {
    const u = new URL(process.env.DB_URL);
    return {
      host: u.hostname,
      port: parseInt(u.port || '3306', 10),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, '') || undefined
    };
  } catch {
    throw new Error('DB_URL is not a valid mysql:// URL.');
  }
})();

const dbConfig = {
  host: fromUrl?.host || process.env.DB_HOST || 'localhost',
  port: fromUrl?.port || parseInt(process.env.DB_PORT || '3306', 10),
  user: fromUrl?.user || process.env.DB_USER || 'root',
  password: fromUrl?.password ?? process.env.DB_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_SIZE || '15', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Managed MySQL (Aiven, PlanetScale, Azure, RDS...) usually requires TLS
  ...(process.env.DB_SSL === 'true'
    ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } }
    : {})
};

const DB_NAME = fromUrl?.database || process.env.DB_NAME || 'ai_interview_db';

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      database: DB_NAME
    });
  }
  return pool;
};

// Helper query runner
export const query = async (sql, params = []) => {
  const p = getPool();
  const [results] = await p.execute(sql, params);
  return results;
};

const ensureColumn = async (dbPool, table, column, definition) => {
  const [rows] = await dbPool.query(
    'SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [DB_NAME, table, column]
  );
  if (rows[0].c === 0) {
    await dbPool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`[DB] Added column ${table}.${column}`);
  }
};

// Ensure database and schema exist
export const initializeDatabase = async () => {
  try {
    // 1. Create the database if we're allowed to. Managed hosts often forbid CREATE DATABASE
    //    (the database already exists), so a failure here is not fatal.
    try {
      const rootConnection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        ...(dbConfig.ssl ? { ssl: dbConfig.ssl } : {})
      });
      console.log(`[DB] Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);
      await rootConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      console.log(`[DB] Database '${DB_NAME}' ensured.`);
      await rootConnection.end();
    } catch (err) {
      console.warn(`[DB] Could not create database (assuming it exists): ${err.message}`);
    }

    // 2. Initialize pool with target database
    const dbPool = getPool();

    // 3. Run schema.sql statements
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of statements) {
        await dbPool.query(stmt);
      }
      console.log('[DB] Database tables successfully synchronized.');
    }

    // 4. Upgrade databases created before these columns existed
    await ensureColumn(dbPool, 'coding_problems', 'starter_codes', 'JSON DEFAULT NULL');
    await ensureColumn(dbPool, 'coding_problems', 'reference_solution', 'MEDIUMTEXT');
    await ensureColumn(dbPool, 'coding_problems', 'topic', 'VARCHAR(191) DEFAULT NULL');
    await ensureColumn(dbPool, 'coding_problems', 'source', "VARCHAR(20) DEFAULT 'manual'");
    await ensureColumn(dbPool, 'coding_problems', 'created_by', 'VARCHAR(64) DEFAULT NULL');

    return true;
  } catch (error) {
    console.error('[DB] Database initialization error:', error.message);
    throw error;
  }
};

export default {
  getPool,
  query,
  initializeDatabase
};
