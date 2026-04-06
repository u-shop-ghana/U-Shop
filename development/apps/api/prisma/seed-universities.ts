import { PrismaClient } from '@prisma/client';

// ─── University Seed Script ─────────────────────────────────────
// Seeds the 5 initial Ghanaian universities that U-Shop supports.
// Run with: npx tsx prisma/seed-universities.ts
//
// This is idempotent — uses upsert so re-running won't create duplicates.

const prisma = new PrismaClient();

// The 5 initial universities with their logos from /assets/images/universities/
const universities = [
  {
    name: 'Ghana Communication Technology University',
    shortName: 'GCTU',
    slug: 'gctu',
    domain: 'gctu.edu.gh',
    logoUrl: '/assets/images/universities/gctu.jpg',
  },
  {
    name: 'University of Ghana',
    shortName: 'UG',
    slug: 'university-of-ghana',
    domain: 'ug.edu.gh',
    logoUrl: '/assets/images/universities/legon.jpg',
  },
  {
    name: 'University of Cape Coast',
    shortName: 'UCC',
    slug: 'university-of-cape-coast',
    domain: 'ucc.edu.gh',
    logoUrl: '/assets/images/universities/ucc.jpg',
  },
  {
    name: 'Kwame Nkrumah University of Science and Technology',
    shortName: 'KNUST',
    slug: 'knust',
    domain: 'knust.edu.gh',
    logoUrl: '/assets/images/universities/knust.jpg',
  },
  {
    name: 'University of Mines and Technology',
    shortName: 'UMAT',
    slug: 'umat',
    domain: 'umat.edu.gh',
    logoUrl: '/assets/images/universities/umat.jpeg',
  },
];

async function main() {
  console.log('🏫 Seeding universities...');

  for (const uni of universities) {
    // Upsert ensures idempotency — safe to re-run without duplicates.
    const result = await prisma.university.upsert({
      where: { shortName: uni.shortName },
      update: {
        name: uni.name,
        slug: uni.slug,
        domain: uni.domain,
        logoUrl: uni.logoUrl,
      },
      create: uni,
    });

    console.log(`  ✅ ${result.shortName} — ${result.name}`);
  }

  console.log(`\n🎉 Seeded ${universities.length} universities.`);
}

main()
  .catch((err: Error) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
