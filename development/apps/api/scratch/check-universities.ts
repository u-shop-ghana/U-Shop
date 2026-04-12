import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUniversities() {
  const universities = await prisma.university.findMany();

  console.log(`Found ${universities.length} universities.`);
  universities.forEach((u, i) => {
    console.log(`${i+1}. Name: ${u.name}, shortName: ${u.shortName}, slug: ${u.slug}`);
    if (!u.shortName) {
      console.warn(`  !!! WARNING: University "${u.name}" is missing a shortName.`);
    }
  });
}

checkUniversities().catch(console.error).finally(() => prisma.$disconnect());
