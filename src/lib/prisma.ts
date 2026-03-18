import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  keepAliveInterval: ReturnType<typeof setInterval> | undefined;
};

const getPrismaClient = () => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL is not defined in environment variables');
  }

  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 15000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  // Handle pool errors gracefully to prevent unhandled rejections
  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = prisma;

  // Keep-alive ping every 4 minutes to prevent Supabase/Neon from sleeping
  if (!globalForPrisma.keepAliveInterval) {
    globalForPrisma.keepAliveInterval = setInterval(async () => {
      try {
        await pool.query('SELECT 1');
      } catch {
        // Connection lost — pool will reconnect on next query
      }
    }, 4 * 60 * 1000);

    // Don't prevent Node.js process from exiting
    if (globalForPrisma.keepAliveInterval.unref) {
      globalForPrisma.keepAliveInterval.unref();
    }
  }

  return prisma;
};

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
