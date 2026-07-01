import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

// DATABASE_URL must be available — Next.js loads .env.local automatically at server startup
const DATABASE_URL = process.env.DATABASE_URL ?? ''

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  if (!DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Make sure .env.local has no BOM and the dev server was restarted.'
    )
  }
  const pool = new Pool({ connectionString: DATABASE_URL })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
