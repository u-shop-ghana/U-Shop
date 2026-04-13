import { ListingService } from '../src/services/listing.service';

async function testSearch() {
  console.log('Testing search for "iPhone"...');
  const results = await ListingService.searchListings({ q: 'iPhone', sort: 'newest', limit: 10 });
  console.log(`Found ${results.length} results.`);
  results.forEach((r: { title: string }) => console.log(`- ${r.title}`));

  console.log('\nTesting empty search (All Products)...');
  const all = await ListingService.searchListings({ sort: 'newest', limit: 20 });
  console.log(`Found ${all.length} results.`);
}

testSearch().catch(console.error);
