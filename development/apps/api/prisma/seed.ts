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

  // Seed Universities
  console.log('\n🌱 Seeding universities...');
  const universities = [
    { name: "University of Ghana", shortName: "UG", slug: "ug", domain: "ug.edu.gh" },
    { name: "Kwame Nkrumah University of Science and Technology", shortName: "KNUST", slug: "knust", domain: "knust.edu.gh" },
    { name: "University of Cape Coast", shortName: "UCC", slug: "ucc", domain: "ucc.edu.gh" },
    { name: "Ghana Communication Technology University", shortName: "GCTU", slug: "gctu", domain: "gctu.edu.gh" },
    { name: "University of Mines and Technology", shortName: "UMAT", slug: "umat", domain: "umat.edu.gh" },
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { slug: uni.slug },
      update: uni,
      create: uni,
    });
    console.log(`  ✅ ${uni.shortName}`);
  }

  console.log(`\n🎉 Seeded ${universities.length} universities.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
