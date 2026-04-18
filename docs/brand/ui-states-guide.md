# UI States Guidelines

This document serves as the declarative reference for how the application visually responds to data fetching, user interactions, validations, and async limits. Following these guidelines ensures an uncompromisingly smooth, resilient, and consistent user experience across the U-Shop platform.

## 1. Loading States

### Page / Data Loading
Skeleton screens for product grids, store pages, and order lists.
- **Rule:** Never use spinner-only full-page blocks.
- **Style:** Skeleton should be `bg-white/5 animate-pulse rounded`, strictly mimicking the actual structural layout.

### MoMo Prompt Waiting
Appears exactly after the Pay button is pressed during checkout.
- **Visuals:** Pulsing phone icon + "Check your phone" helper text + countdown timer (120s limit).
- **Rule:** Cancel link must be distinctly visible. This state **replaces** the entire active payment step UI.

### Paystack Webhook Pending
Occurs intrinsically after Paystack redirects back from external gateways.
- **Visuals:** Polling state text: "Confirming your payment…" paired with a loading spinner.
- **Action:** Poll `GET /orders/[id]` every 2 seconds for up to 30 seconds.
- **Fallback Rule:** If validation persists past typical SLAs: "Taking longer than expected — your order is being checked."

### Image Upload Progress
Encountered exclusively within the listing creation/editing form.
- **Visuals:** Each uploaded photo explicitly shows an internal upload progress bar bridging to Supabase Storage. The thumbnail appears underneath with an overlay progress interface.
- **Rule:** Upload errors are tightly scoped **per-file**, never globally blocking independent streams.

### Search Results
Applied to the live search bar dropdown/page.
- **Execution:** Skeleton cards visibly appear universally after a 300ms debounce cycle, replacing natively with real results.
- **Rule:** **Never** show an empty structural state during the 300ms loading window (prevents jarring flashes of "No results" prematurely terminating the UX).

---

## 2. Empty States

### Search No Results
- **Icon:** `SearchX`
- **Headline:** "No results for '[query]'"
- **Subtext:** "Try a broader search or check your spelling."
- **CTA:** "Clear search"
- **Rule:** **Do NOT** show a broken or unmapped product grid structurally.

### Empty Store
Fired on `/store/[slug]` when the merchant has exactly 0 active listings.
- **Icon:** `Package`
- **Headline:** "No listings yet."
- **Subtext:** "This seller hasn't listed anything yet — check back soon."
- **Rule:** No CTA is needed structurally here.

### No Orders (Buyer)
Positioned intuitively on the buyer-side order history page.
- **Icon:** `ShoppingBag`
- **Headline:** "No orders yet."
- **CTA:** "Browse Listings" → explicitly links and fires router back to homepage.

### No Orders (Seller)
Positioned inside the seller command dashboard over orders tab.
- **Icon:** `Inbox`
- **Headline:** "No orders yet."
- **Subtext:** "Share your store link to start getting orders."
- **CTA:** "Copy store link" clipboard button.

### Empty Wallet
Triggered implicitly when Wallet balance is exactly GH₵ 0.00 and transaction histories yield empty.
- **Visuals:** Show string "Complete your first sale to see earnings here."
- **Rule:** Absolutely **no payout button** should be rendered until the balance reaches the arbitrary GH₵ 20 operational mark.

---

## 3. Error States

### MoMo Payment Failed
- **Visuals:** Alerting Red toast: "Payment didn't go through. Check your MoMo balance or try a different number."
- **CTA:** A distinct retry button, alongside a "Try card instead" secondary path option.
- **Rule:** Do **not** send the user unceremoniously back to the structural start of checkout. Keep them scoped within the payment pipeline.

### MoMo Prompt Timeout
Triggers natively exactly after the 120s MoMo payment polling expires.
- **Visuals:** "MoMo prompt timed out. Check your phone and try again."
- **Icon:** Animated red phone with an X overlay.
- **CTAs:** Two prominent buttons: "Try Again" (Primary) and "Try a different payment method" (Secondary).

### Form Validation
- **Visuals:** Inline contextual formatting errors positioned tightly below each offending/invalid text field. Trigger a Red border + red helper text.
- **Rule:** **Never** invoke alert dialogs or toasts for simple inline field errors. Always natively scroll directly to the first error offset on generic submits.
- **Text:** Error payloads must be highly specific natively avoiding generic traps (e.g. "Phone must be 10 digits" vs the generic "Invalid phone").

### Out of Stock
- **Condition:** Item Product Listing Card.
- **Visuals:** Grey "Sold Out" structural badge heavily overlaid atop the primary image. On the Product Detail Page (PDP), the typical Buy Now button gets formally replaced with: "This item is sold out." + "Message Seller" as the **only** exclusive CTA.
- **Rule:** **No checkout pipelines** are mathematically possible.

### Network / Server Error
- **Visuals:** Clean generic catch-all global toast uniformly stating: "Something went wrong — try again." Includes the `RefreshCw` icon contextually.
- **Rule:** Completely mask and never expose raw error codes or stack traces natively to browsers. Fire these silently down into the Sentry sink unconditionally.

### Payout Failed
In the internal wallet/balances tab.
- **Visuals:** Heavy red banner stating: "Your last payout of GH₵ X failed. Reason: [Paystack reason]. Your balance has been restored."
- **CTAs:** "Update payout account" natively mapping settings routing, alongside a standard "Retry" structural button.

---

## 4. Success & Pending States

### Payment Confirmed
- **Visuals:** Captivating full-screen success takeover screen. Large animated shield verification. "Payment received — GH₵ X held in escrow." Accompanied contextually by the standard Order ID. Show countdown timers pointing intrinsically to auto-release boundaries.
- **CTAs:** Dual actions: "View Order" and "Continue Shopping".

### Delivery Confirmed
- **Action Pre-flight:** Displays a tight Confirmation Modal rigorously before engaging network actions (presenting irreversible structural warning layouts).
- **Post-Confirm:** Massive green banner confirms: "Delivery confirmed — payment is being released to the seller." A scheduled review prompt follows closely after a 24-hour buffer window.

### Escrow Countdown
Positioned deeply visible natively on the exact buyer order details view.
- **Visuals:** Bright amber countdown timer format: "7 days → 2 days 14 hours".
- **Condition:** On Day 5+, the badge urgently shifts color formatting towards rose-red alongside a tightly coupled "Open a dispute now if there's an issue" hard warning interface.

### Student Verification Pending
Targeting precisely the seller profile hub natively.
- **Visuals:** Subtle amber "Verification Pending" soft badge.
- **Notification Text:** Internal progress notes explicitly reading: "We'll review your ID within 24 hours." mapped into a safely dismissable info card.
- **Rule:** Even while pending sequentially, the user inherently can securely still list and sell seamlessly.
