import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNulls() {
  const count = await prisma.$queryRaw`SELECT count(*) as count FROM "Listing" WHERE "searchVector" IS NULL`;
  console.log('Null count:', count);
}

checkNulls().catch(console.error).finally(() => prisma.$disconnect());
