# Mobile Layout Rules

**90% of Our Users Are on Phones**

Every layout decision starts at 375px (iPhone SE / budget Android) and scales up. Never design desktop-first and retrofit down to mobile. These directives are non-negotiable constraints, not suggestions.

## 1. The Network Reality
Our users are predominantly on Ghanaian mobile data networks (3G is common). Page loads above 3s will cause abandonment. Every component must be optimised for slow network conditions: skeleton screens over spinners, progressive image loading, and strictly minimal JavaScript bundle sizes on critical paths.

---

## 2. Universal Mobile Rules (Every Screen)

| Rule | Specification | Why |
|---|---|---|
| **Nav Pattern** | Bottom tab bar (mobile) replaces sidebar. Tabs: Home · Search · Orders · Account · Sell. Max 5 tabs. No hamburger menu for primary nav. | Thumb reach natively supports bottom nav one-handed. Hamburger menus are a definitive UX anti-pattern on mobile. |
| **Touch Targets** | All tappable elements minimum 44×44px. Buttons min 48px height. Icon buttons get a padding wrapper of at least 12px. | Hits WCAG 2.5.5 targets + drastically reduces tap errors on small screens. |
| **Font Size** | Input fields: never below 16px. Body text: minimum 14px. Headings scale: 28px (H1), 22px (H2), 18px (H3) on mobile. | 16px explicitly prevents iOS Safari auto-zoom on input focus. Sub-14px body text is strictly unreadable on budget screens. |
| **Padding / Spacing** | Screen-edge padding: `px-4` (16px). Card internal padding: `p-4`. Bottom safe area padding: `pb-safe` for iPhone notch interfaces. | Content must not touch screen edges organically. Bottom tabs sit above home indicator. |
| **Tap Feedback** | All interactive elements must fire `active:scale-[0.97] + transition-transform duration-100`. Immediate physical visual feedback on tap. | Users on dense touch screens need instant confirmation their hardware tap registered, especially over slow validation APIs. |
| **Scroll Behavior** | Absolutely no horizontal scroll on any screen except category pills (intended). No scroll-jacking. Use `overflow-x-auto` for pill rows with `scrollbar-none`. | Unexpected horizontal scroll is universally one of the top mobile UX abandonment vectors. |

---

## 3. Screen-Specific Mobile Rules

### Homepage
- **Desktop Layout:** 3-column product grid. Filter bar inline.
- **Mobile Layout:** 2-column grid (`min-w: 160px` per card). Filter bar collapses entirely to "Filters" button → triggers bottom sheet drawer.
- **Key Change:** Bottom sheet for filters aggressively preserves screen real estate. Card images naturally map `aspect-square`, never 4:3.

### Storefront
- **Desktop Layout:** Banner + 2-column header (avatar left, info right). Policy panel in right column. Listings in 3-column grid.
- **Mobile Layout:** Banner pushes full-width (`56px` tall). Avatar organically overlaps banner bottom-left (circle, `border-white`). Info directly below avatar. Policy panel executes full-width. Listings fall into 2-column grid.
- **Key Change:** Policy panel **must** scroll into view without requiring a tap — explicitly do not hide trust metrics inside an accordion on mobile. It is trust-critical.

### Product Detail (PDP)
- **Desktop Layout:** 2-column: image gallery left, purchase info right.
- **Mobile Layout:** Single vertical flow. Gallery acts full-width (`aspect-square`). Info sequentially below. "Buy Now" button becomes strictly sticky at the absolute bottom of the viewport inside a safe-area-aware bar. Info tabs drop below and swipe.
- **Key Change:** Sticky Buy Now bar (`fixed bottom-0 left-0 right-0 bg-[#0D1117]/90 backdrop-blur-md p-4 pb-safe z-50`). The actual item price anchors inside this sticky bar natively. Trust shield completely stays with the page content body (above the fold).

### Checkout
- **Desktop Layout:** 2-column layout mapping: form left, order summary firmly sticky right.
- **Mobile Layout:** Single column. Order summary becomes a collapsible accordion pinned to the top (collapsed by default, exclusively showing the total price). Logical form below. Payment method cards stack cleanly vertically. MoMo network selection executes a 3-button row, 100% full width. Pay button is strictly full-width (`56px` block), pinned to the absolute bottom of page.
- **Key Change:** MoMo number keyboard enforces `inputMode="tel"` surfacing numerical pads universally on iOS/Android. `+233` country code is firmly pre-filled and DOM locked. Escrow explainer acts full-width, permanently non-collapsible.

### Seller Dashboard
- **Desktop Layout:** Formal sidebar navigation bounding a main content workspace.
- **Mobile Layout:** Bottom tab bar replaces sidebar completely. The Overview tab natively defaults. Add Listing enforces a full-screen modal or dedicated sub-route. Photo uploads strictly capture the native generic file picker via `accept="image/*"` with `capture` attribute dynamically enabling camera.
- **Key Change:** Listing form natively converts fields strictly one-per-screen (building step-by-step generic wizards natively on mobile). This definitively reduces psychological overwhelm and input errors spanning small screens. Dynamic Progress indicators (`step X of N`).

---

## 4. Critical Mobile Performance Directives

### Image Optimisation
All product images served natively via Next.js `<Image />` mapping automatic WebP conversion and responsive `srcSet`. Thumbnails max out securely at `400px` broad. Detail views scale to `800px`. **Never** load 1000px+ images to a mobile client payload conditionally.

### Critical CSS First
The Homepage, PDP, and Checkout routines **must** seamlessly hit First Contentful Paint (FCP) inside `<1.5s` on a 3G simulated constraint. Directly invoke Next.js App Router streaming paired to `<Suspense>` boundaries aggressively wrapping non-critical DOM components.

### Offline Awareness
Always actively observe network drops. If disconnections arise:
- Surface native toast: *"You're offline — check your connection."*
- Structurally disable the explicit payment button casting *"Internet required to pay"* explicit tooltip overlay.
- Previously loaded catalogue listings heavily remain actively read-only queryable entirely isolated locally from internal network cache mechanisms.

### Form Persistence
Crucial Checkout Form fields strongly preserve to `sessionStorage` natively spanning active input cycles (`onChange`). If an active user navigates backwards unexpectedly out of funnel, fields dynamically restore natively. Extremely critical securing address and phone number entries — aggressively **do not** make users retype values.

---

## 5. Tailwind Breakpoint Reference Matrix

| Breakpoint | Width | Target Devices | Primary Layout Mode |
|---|---|---|---|
| `default` (no prefix) | `0px–639px` | All phones (iPhone SE → Samsung Galaxy A-series) | Single column, bottom tab nav, stacked strictly mapped CTAs |
| `sm:` | `640px–767px` | Large phones (iPhone Pro Max, Samsung Ultra) | 2-column product grid seamlessly unlocks |
| `md:` | `768px–1023px` | Tablets (iPad, Android tablet) | Sidebar nav safely unlocks. 2-column checkout inherently unlocks. |
| `lg:` | `1024px–1279px` | Small laptops | 3-column product grid invokes safely. Full desktop generic layout structure. |
| `xl:` | `1280px+` | Desktop / large screens | Centered max-width primary container `max-w-[1280px]` firmly locks constraints. |
