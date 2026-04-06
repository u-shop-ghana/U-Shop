import { PrismaClient } from '@prisma/client';
import { CATEGORIES } from '@ushop/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed categories with icons from /assets/images/categories/.
  // Uses upsert for idempotency — safe to re-run after adding new
  // categories or updating image paths.
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i]!;
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        iconUrl: cat.iconUrl,
        order: i,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        iconUrl: cat.iconUrl,
        order: i,
      },
    });
    console.log(`  ✅ ${cat.name}${cat.iconUrl ? ' (with icon)' : ''}`);
  }

  console.log(`\n🎉 Seeded ${CATEGORIES.length} categories.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
