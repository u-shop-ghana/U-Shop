import { ListingService } from '../services/listing.service';

async function testSearch() {
  console.log('Testing search for "iPhone"...');
  const results = await ListingService.searchListings({ q: 'iPhone' });
  console.log(`Found ${results.length} results.`);
  results.forEach(r => console.log(`- ${r.title}`));

  console.log('\nTesting empty search (All Products)...');
  const all = await ListingService.searchListings({});
  console.log(`Found ${all.length} results.`);
}

testSearch().catch(console.error);
