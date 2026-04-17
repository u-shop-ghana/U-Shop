import http from 'k6/http';
import { check, sleep } from 'k6';

// ─── K6 Load Test Configuration ────────────────────────────────
// Run locally using: k6 run load-test.js
// 
// This mimics a traffic spike on the U-Shop API.
// It will ramp up from 0 to 50 virtual users, plateau for 2 minutes,
// and then ramp back down.

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 50 },   // Spike up to 50 users over 1 minute
    { duration: '2m', target: 50 },   // Stay at 50 users for 2 minutes (Sustained load)
    { duration: '30s', target: 0 },   // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate must be extremely low (less than 1%)
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000/api/v1';

export default function () {
  // 1. Health check - High frequency baseline test
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Fetch public stores (Tests DB Read performance)
  const storesRes = http.get(`${BASE_URL}/stores`);
  check(storesRes, {
    'stores status is 200': (r) => r.status === 200,
  });

  sleep(2);

  // 3. Search multiple listings (Tests complex query/pagination performance)
  const listingsRes = http.get(`${BASE_URL}/listings?category=laptops&limit=10`);
  check(listingsRes, {
    'listings search is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
