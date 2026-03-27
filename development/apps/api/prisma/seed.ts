import { PrismaClient } from '@prisma/client';
import { CATEGORIES } from '@ushop/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed categories
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]!;
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        order: i,
      },
    });
    console.log(`  ✓ Category: ${cat.name}`);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
