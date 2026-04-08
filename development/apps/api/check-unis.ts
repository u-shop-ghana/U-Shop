import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const unis = await prisma.university.findMany();
  console.log(JSON.stringify(unis, null, 2));
}
run().finally(() => prisma.$disconnect());
