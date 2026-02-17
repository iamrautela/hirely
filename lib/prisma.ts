import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

type PoolType = InstanceType<typeof pg.Pool>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgPool: PoolType | undefined
}

// Get DATABASE_URL or use a dummy one for build time
const databaseUrl = process.env.DATABASE_URL

let prisma: PrismaClient
let pool: PoolType | undefined

// Check if we have a real database URL
if (databaseUrl && databaseUrl !== '') {
  // Real database connection with adapter
  pool = globalForPrisma.pgPool ?? new pg.Pool({
    connectionString: databaseUrl,
  })

  prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter: new PrismaPg(pool),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
    globalForPrisma.pgPool = pool
  }
} else {
  // Build time fallback - Prisma 7 requires adapter or accelerateUrl
  // We'll create a minimal client that won't actually connect
  const dummyPool = new pg.Pool({
    connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
    max: 1,
    idleTimeoutMillis: 1,
    connectionTimeoutMillis: 1,
  })
  
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter: new PrismaPg(dummyPool),
    log: ['error'],
  })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
}

export { prisma }