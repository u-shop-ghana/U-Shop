# U-Shop Penetration Testing & Security Guide

This document outlines the standard security checks that should be performed manually before major releases, supplementing external Bug Bounties and automated ZAP scans.

## 1. Authentication & Authorization (Supabase + Next.js)
- [ ] **JWT Forgery**: Ensure the API does not blindly trust JWTs but explicitly verifies them against the Supabase `AUTH_SECRET`.
- [ ] **Data Isolation (RLS)**: Login as User A, extract the `accessToken`, and attempt to fetch `GET /api/v1/orders` representing User B. The API MUST reject this (403 Forbidden).
- [ ] **Session Replay**: Ensure `access_tokens` expire quickly and are rotated via refresh tokens rather than allowing infinite lifespan.

## 2. Injection & Malicious Payloads (Express + Prisma)
- [ ] **SQL Injection**: We use Prisma which parametrizes SQL by default. However, verify any custom `$queryRaw` statements strictly use parametrized variables, NOT string concatenation.
- [ ] **Cross-Site Scripting (XSS)**: Attempt to inject `<script>alert(1)</script>` into:
  - Product Listing Descriptions
  - User Bios / Profiles
  - Store Names
  *Ensure React automatically escapes these during render in the Next.js frontend.*
- [ ] **File Executables via Supabase Storage**: Upload a `.php` or `.html` file with a malicious `<script>` tag pretending to be an avatar. Verify `supabase-storage` forces the `Content-Disposition: attachment` when loaded, preventing it from executing in the browser context.

## 3. Denial of Service (DoS) Protections
- [ ] **Rate Limiting**: Run `node rate-limit-test.js` to ensure mass spam causes a `429 Too Many Requests`.
- [ ] **Payload Size Limit**: Attempt to send a 50MB JSON payload to a simple endpoint (e.g. `POST /login`). Verify it is rejected with a `413 Payload Too Large` error rather than crashing the Node process.
- [ ] **Pagination Abuse**: Request `GET /api/v1/listings?limit=1000000`. Does the database struggle? Force limit overrides in API controllers to restrict to a max offset (e.g., limit=50 max).

## 4. Business Logic Abuses
- [ ] **Negative Quantities**: Try adding `-5` items to a cart. Is it rejected or does it subtract money from the total?
- [ ] **Price Manipulation**: The frontend sends a total via Paystack. Ensure the API *re-calculates* the total reliably via the Database rather than trusting the user-provided `totalPrice`.

> Use tools like [Burp Suite Community Edition](https://portswigger.net/burp) or OWASP ZAP proxy for capturing and tampering with these requests during manual testing.
