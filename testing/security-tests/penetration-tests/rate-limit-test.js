const http = require('http');

/**
 * U-Shop Local Rate Limiting & Penetration Test script.
 * 
 * Objective: Verify that the backend Express framework rejects requests appropriately
 * when hit with an aggressive burst of scraping or brute-forcing behavior.
 * 
 * Run with: node testing/security-tests/penetration-tests/rate-limit-test.js
 */

const TARGET_URL = 'http://127.0.0.1:4000/api/v1/health';
const REQUESTS_TO_FIRE = 200; // The threshold shouldn't allow this many per minute usually
let successful = 0;
let rateLimited = 0;
let errors = 0;

console.log(`🚀 Starting Aggressive Rate Limit Test against ${TARGET_URL}...`);
console.log(`Firing ${REQUESTS_TO_FIRE} parallel requests.\n`);

async function makeRequest() {
  return new Promise((resolve) => {
    const req = http.get(TARGET_URL, (res) => {
      if (res.statusCode === 200) {
        successful++;
      } else if (res.statusCode === 429) {
        rateLimited++;
      } else {
        errors++;
      }
      
      // Consume response data to free up memory
      res.on('data', () => {});
      res.on('end', resolve);
    });

    req.on('error', (err) => {
      errors++;
      resolve();
    });
  });
}

async function run() {
  const promises = [];
  const startTime = Date.now();

  for (let i = 0; i < REQUESTS_TO_FIRE; i++) {
    promises.push(makeRequest());
  }

  await Promise.all(promises);
  const timeTaken = Date.now() - startTime;

  console.log('📊 Test Complete!');
  console.log(`Time taken: ${timeTaken}ms`);
  console.log(`Successful (200 OK): ${successful}`);
  console.log(`Rate Limited (429 Too Many Requests): ${rateLimited}`);
  console.log(`Errors (e.g. connection refused): ${errors}\n`);

  if (rateLimited > 0) {
    console.log('✅ PASS: Rate limiting is actively blocking massive traffic bursts.');
  } else if (errors === REQUESTS_TO_FIRE) {
    console.log('❌ ERROR: All requests failed. Is the dev server running on port 4000?');
  } else {
    console.log('❌ FAIL: No requests were rate limited! Are you missing rate-limiter middleware?');
  }
}

run();
