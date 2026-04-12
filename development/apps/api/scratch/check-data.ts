import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkListings() {
  const listings = await prisma.listing.findMany({
    include: {
      store: true,
    }
  });

  console.log(`Found ${listings.length} listings.`);
  listings.forEach((l, i) => {
    console.log(`${i+1}. Title: ${l.title}, Status: ${l.status}, Stock: ${l.stock}, Vector: ${l.searchVector ? 'Populated' : 'NULL'}`);
  });
}

checkListings().catch(console.error).finally(() => prisma.$disconnect());
