import prismaPkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { PrismaClient } = prismaPkg as any
const { Pool } = pg as any

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
  pgPool: any | undefined
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  // In Next.js build/SSR environments, this will surface early and clearly.
  throw new Error("Missing env var: DATABASE_URL")
}

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: databaseUrl,
  })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pgPool = pool
}