# U-Shop Typography System
**Version:** 1.0.0 | **Owner:** Brand & Design | **Status:** Active

> Typography is not decoration. It is the silent interface between our content and
> our users. Every sizing decision, every weight choice, and every tracking rule
> in this document was made to serve legibility, hierarchy, and brand personality
> simultaneously — at any screen size, on any Ghanaian mobile device.

---

## 1. Typeface Selection

### 1.1 Primary Typeface: Plus Jakarta Sans

**Why Plus Jakarta Sans?**

Plus Jakarta Sans is a geometric humanist sans-serif designed for digital interfaces. It combines the structural precision of geometric typefaces (Futura, Circular) with the warmth and readability of humanist designs (Gill Sans). For U-Shop, this combination maps perfectly onto our brand tension: technological authority (geometric) + approachable energy (humanist).

Key properties that make it right for us:
- **Optical clarity at small sizes.** Critical for product metadata, prices, and status badges on mobile.
- **Expressive at display sizes.** Headlines at 48px+ carry weight and personality without needing extra letter-spacing tricks.
- **Variable font support.** The variable axis allows precise weight tuning without loading multiple font files.
- **Excellent Latin + extended character support.** Renders cleanly on all Android devices common in the Ghanaian market (Samsung Galaxy A series, Tecno, Itel).
- **Open source (SIL OFL).** Free to use, no licensing complications.

**Load from Google Fonts:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

**Or via npm (recommended for Next.js):**
```typescript
// app/layout.tsx — Next.js App Router font loading
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});
```

### 1.2 Secondary / Monospace Typeface: IBM Plex Mono

Used exclusively for: code snippets, API references, price display in certain contexts (see §4), transaction IDs, order numbers, timestamps in compact contexts, and developer-facing documentation.

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Tailwind config:**
```js
theme: {
  extend: {
    fontFamily: {
      'sans': ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      'mono': ['IBM Plex Mono', 'ui-monospace', 'monospace'],
    },
    fontVariant: '--font-jakarta',
  }
}
```

---

## 2. Weight System

We use a deliberate 4-weight system. Not every weight is appropriate in every context. Using too many weights destroys hierarchy.

| Weight | Value | Name | Primary Use |
|---|---|---|---|
| **Light** | 300 | `font-light` | Large decorative text only. Subheadings at 32px+. Never body text. |
| **Regular** | 400 | `font-normal` | All body text. Descriptions. Longer-form content. |
| **Medium** | 500 | `font-medium` | Labels. Navigation items. Card metadata. Secondary emphasis. |
| **SemiBold** | 600 | `font-semibold` | Subheadings. Section labels. Input field labels. Feature names. |
| **Bold** | 700 | `font-bold` | H2, H3, H4 headings. Button text. Price display. |
| **ExtraBold** | 800 | `font-extrabold` | H1 only. Hero headlines. Critical display text. |

**The rule for weight selection:** If you are debating between two weights, choose the lighter one and compensate with size. Excessive bolding reads as shouting, not emphasis.

---

## 3. Type Scale — The Complete Hierarchy

All sizes are defined in `rem` with pixel equivalents at 16px base. Never hard-code pixel values in components — always use the named scale.

### 3.1 Display & Heading Scale

| Token | Size (rem) | Size (px) | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `text-display` | 3.75rem | 60px | 800 ExtraBold | 1.1 | -0.03em | Hero headline, landing page one-liner |
| `text-h1` | 3rem | 48px | 800 ExtraBold | 1.15 | -0.025em | Page titles, section heroes |
| `text-h2` | 2.25rem | 36px | 700 Bold | 1.2 | -0.02em | Major section headings |
| `text-h3` | 1.875rem | 30px | 700 Bold | 1.25 | -0.015em | Card headings, subsection titles |
| `text-h4` | 1.5rem | 24px | 600 SemiBold | 1.3 | -0.01em | Widget headings, sidebar titles |
| `text-h5` | 1.25rem | 20px | 600 SemiBold | 1.35 | 0 | Component headings, dialog titles |
| `text-h6` | 1.125rem | 18px | 600 SemiBold | 1.4 | 0 | Card titles, label headings |

### 3.2 Body & UI Text Scale

| Token | Size (rem) | Size (px) | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `text-lg` | 1.125rem | 18px | 400 Regular | 1.75 | 0 | Large body text, feature descriptions |
| `text-base` | 1rem | 16px | 400 Regular | 1.75 | 0 | Standard body copy, card descriptions |
| `text-sm` | 0.875rem | 14px | 400 Regular | 1.65 | 0 | Secondary info, helper text, metadata |
| `text-xs` | 0.75rem | 12px | 500 Medium | 1.5 | 0.01em | Badges, tags, timestamps, captions |
| `text-2xs` | 0.625rem | 10px | 500 Medium | 1.4 | 0.04em | Legal text, footnotes, label system only |

### 3.3 UI Component Text

| Component | Size | Weight | Tracking | Notes |
|---|---|---|---|---|
| **Button — Large** | 1rem (16px) | 700 Bold | 0.01em | Uppercase NOT used. Title case only. |
| **Button — Medium** | 0.9375rem (15px) | 700 Bold | 0.01em | |
| **Button — Small** | 0.8125rem (13px) | 600 SemiBold | 0.01em | |
| **Input field text** | 1rem (16px) | 400 Regular | 0 | Never below 16px — prevents iOS auto-zoom |
| **Input label** | 0.875rem (14px) | 600 SemiBold | 0 | |
| **Input placeholder** | 1rem (16px) | 400 Regular | 0 | Color: `ink-muted` (`#7A7D8E`) |
| **Navigation link** | 0.875rem (14px) | 500 Medium | 0 | Active state: 600 SemiBold |
| **Badge / tag** | 0.75rem (12px) | 500 Medium | 0.04em | |
| **Tab label** | 0.9375rem (15px) | 500 Medium | 0 | Active: 700 Bold |
| **Section label / eyebrow** | 0.6875rem (11px) | 600 SemiBold | 0.18em | UPPERCASE always. Color: brand accent. |
| **Toast notification** | 0.875rem (14px) | 500 Medium | 0 | |
| **Tooltip** | 0.8125rem (13px) | 400 Regular | 0 | |

---

## 4. Special Cases: Price & Financial Typography

Prices are the most important number on a product page. They deserve their own rules.

| Context | Size | Weight | Font | Format |
|---|---|---|---|---|
| **Product card — primary price** | 1.5rem (24px) | 700 Bold | Plus Jakarta Sans | `GH₵ 1,500` |
| **Product detail — primary price** | 2.25rem (36px) | 800 ExtraBold | Plus Jakarta Sans | `GH₵ 1,500` |
| **Cart / checkout — line item** | 1rem (16px) | 600 SemiBold | Plus Jakarta Sans | `GH₵ 1,500` |
| **Cart / checkout — total** | 1.5rem (24px) | 800 ExtraBold | Plus Jakarta Sans | `GH₵ 1,500` |
| **Wallet balance** | 2.5rem (40px) | 800 ExtraBold | Plus Jakarta Sans | `GH₵ 4,200.00` |
| **Seller earnings — dashboard** | 3rem (48px) | 800 ExtraBold | Plus Jakarta Sans | `GH₵ 12,400` |
| **Transaction ID / order number** | 0.8125rem (13px) | 500 Medium | IBM Plex Mono | `#ORD-2024-001234` |
| **Timestamp** | 0.75rem (12px) | 400 Regular | IBM Plex Mono | `14 Aug 2024 · 11:43 AM` |

**Currency formatting rules:**
- Always use the Ghana Cedis symbol: **GH₵** (not GHS, not ₵ alone)
- Space between symbol and number: **GH₵ 1,500** (not GH₵1,500)
- Cedis symbol color: inherit from the parent text color, or use `ushop-purple` for emphasis
- Amounts above GH₵ 1,000 always use comma separators: **GH₵ 2,000** not GH₵ 2000
- Never show more than 2 decimal places to buyers. Round to nearest pesewa.

---

## 5. Mobile Typography Rules

### 5.1 Minimum Sizes for Mobile

These minimums are non-negotiable. Below these sizes, text fails readability standards on budget Android devices — the majority of our user base.

| Context | Minimum Size | Reason |
|---|---|---|
| Input field text | 16px | Prevents iOS Safari auto-zoom on focus |
| Body copy | 14px (15px preferred) | Readability on 5.5" screens at arm's length |
| Navigation | 12px | Cannot go smaller for interactive targets |
| Touch targets (text links) | Min 44×44px area | WCAG 2.5.5 touch target size |

### 5.2 Responsive Scale Adjustments

At screen widths below 768px, scale headings down to prevent text overflow and maintain rhythm.

| Token | Desktop | Mobile (< 768px) |
|---|---|---|
| `text-display` | 60px | 40px |
| `text-h1` | 48px | 34px |
| `text-h2` | 36px | 28px |
| `text-h3` | 30px | 24px |

Implementation with Tailwind:
```html
<!-- Example: Hero headline with responsive scaling -->
<h1 class="text-[34px] md:text-h1 font-extrabold tracking-tight text-ink-text">
  Buy and sell tech you trust.
</h1>
```

---

## 6. Typographic Do's and Don'ts

### Do

- **Do** use negative letter spacing (`tracking-tight`) on headings at 24px and above. Geometric typefaces at large sizes benefit from tighter spacing.
- **Do** use `text-balance` (CSS) on headings to prevent awkward single-word last lines.
- **Do** set maximum line lengths: `max-w-[65ch]` for body copy. Lines over 75 characters are hard to track.
- **Do** use 1.7–1.8 line height for all paragraph text. This is critical for readability on screen.
- **Do** use `font-variant-numeric: tabular-nums` for any column of numbers (prices, quantities, dates). This prevents number columns from jiggling.

### Don't

- **Don't** use all-caps for anything longer than 3 words. Section labels (eyebrows) are the exception.
- **Don't** use italic for anything except editorial quotes or product condition descriptions. Our typeface's italic is not designed for UI use.
- **Don't** center-align body text over 2 lines. Center alignment is for headings, single-line labels, and empty states only.
- **Don't** use more than 3 type sizes on a single card. If you're reaching for a 4th size, your card is doing too much.
- **Don't** use light weight (300) on dark backgrounds at sizes below 20px. It disappears on low-brightness screens.
- **Don't** underline text except for hyperlinks. Use weight or color for non-link emphasis.
- **Don't** use the `text-2xs` scale (10px) for anything interactive. It is for legal text and data labels only.

---

## 7. CSS Token Reference

```css
/* src/styles/typography.css */
:root {
  --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  /* Scale */
  --text-display: 3.75rem;
  --text-h1:      3rem;
  --text-h2:      2.25rem;
  --text-h3:      1.875rem;
  --text-h4:      1.5rem;
  --text-h5:      1.25rem;
  --text-h6:      1.125rem;
  --text-lg:      1.125rem;
  --text-base:    1rem;
  --text-sm:      0.875rem;
  --text-xs:      0.75rem;
  --text-2xs:     0.625rem;

  /* Line heights */
  --leading-display: 1.1;
  --leading-heading:  1.25;
  --leading-body:     1.75;
  --leading-tight:    1.4;
  --leading-relaxed:  1.85;

  /* Tracking */
  --tracking-tightest: -0.03em;
  --tracking-tight:    -0.02em;
  --tracking-normal:   0;
  --tracking-wide:     0.04em;
  --tracking-widest:   0.18em;  /* Section labels only */
}
```

---

*Typography tokens are enforced via the ESLint plugin `eslint-plugin-tailwindcss`. Any use of arbitrary `text-[NNpx]` values outside the approved scale will flag a linting warning in development and fail CI in production.*
