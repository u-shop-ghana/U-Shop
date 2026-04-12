import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSearchVectors() {
  console.log('🔍 Populating missing searchVectors...');
  
  // We use the same English configuration as the ListingService
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "Listing"
    SET "searchVector" = to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
    WHERE "searchVector" IS NULL
  `);

  console.log(`✅ Updated ${result} listings.`);
}

fixSearchVectors().catch(console.error).finally(() => prisma.$disconnect());
