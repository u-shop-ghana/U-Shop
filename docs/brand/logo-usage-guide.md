# U-Shop Logo Usage Guide
**Version:** 1.0.0 | **Owner:** Brand & Design | **Status:** Active

> The U-Shop logo is not decoration — it is the primary trust signal we have with
> new users. Every time a logo is misused, distorted, or placed incorrectly, we lose
> a small amount of the credibility it took real effort to build. These rules exist
> to protect that credibility. They apply to every designer, developer, marketing
> partner, and vendor who touches this logo.
>
> **Source files are located at:** `/brand/assets/logo/`
> **Do not recreate the logo from scratch. Always use the provided source files.**

---

## 1. The Logo System — Overview

U-Shop has three official logo forms. Each has a specific context of use. Substituting one form for another in the wrong context is a misuse of the logo.

| Form | Name | Files | Primary Use |
|---|---|---|---|
| **Form A** | Primary Wordmark | `logo-primary.svg`, `logo-primary.png` | Web headers, email headers, marketing collateral, press kit |
| **Form B** | Icon + Wordmark (Stacked) | `logo-stacked.svg`, `logo-stacked.png` | Square-format marketing, presentation title slides, social profile banners |
| **Form C** | Icon Only (App Icon) | `logo-icon.svg`, `android-chrome-192x192.png`, `favicon.ico` | App icon, browser tab, social media profile picture, small-format applications |

---

## 2. Form A — Primary Wordmark: Anatomy

The primary wordmark consists of two distinct elements that must always appear together and in their correct proportions.

### 2.1 The U-Block

- A solid square with perfectly sharp corners (0 border radius)
- Background color: **Signature Red** `#E8000B` — no gradient, no transparency, no other color
- The "U" letterform: white (`#FFFFFF`), bold, uppercase, optically centered within the block
- The block's width-to-height ratio is **1:1 (square)**. Never a rectangle.
- The "U" uses a slightly heavier stroke weight than standard type to maintain visual weight at all sizes

### 2.2 The "shop" Wordmark

- Set in **Plus Jakarta Sans**, Bold (700 weight)
- Lowercase only. Capital S is never used in the wordmark.
- A left-to-right gradient fills the letterforms: `linear-gradient(90deg, #6B1FA8, #D4009B)`
- On digital: achieved via `background-clip: text` in CSS
- On print: use the provided CMYK-converted spot color guide for gradient print production
- Letter-spacing: `-0.02em` (slight tightening for display alignment)
- The baseline of "shop" aligns to the bottom of the U-block
- The cap-height of "shop" is approximately **68%** of the U-block height

### 2.3 Spacing Between Elements

There is a fixed gap between the U-block and the start of the "shop" wordmark. This gap equals **50% of the U-block width** and is non-negotiable. It is built into the source files — do not adjust it.

```
[U-block][gap = 0.5× block width]["shop" wordmark]
```

---

## 3. Form C — App Icon: Anatomy

The app icon (`android-chrome-192x192.png`) is a distinct mark — not a crop of the wordmark.

- **Background:** Near-black, `#0A0A0A`
- **Foreground mark:** A shopping cart silhouette with the "U" letterform integrated into the cart basket
- **Color:** The cart mark uses the brand gradient `#6B1FA8 → #D4009B`, applied with a neon glow treatment on the icon
- **Shape:** The icon is supplied in square format. Rounding (for iOS/Android app icon grids) is applied by the operating system — do not pre-round the source file.

The app icon is a standalone mark. It appears without the "shop" wordmark in all contexts where it is used.

---

## 4. Clearspace Rules

Clearspace is the minimum empty space that must surround the logo on all sides. Nothing — text, images, other logos, decorative elements — may enter the clearspace zone.

### 4.1 Primary Wordmark Clearspace

The clearspace unit is defined as **1× the height of the U-block.** Call this unit `X`.

```
         X
    ┌─────────────────────────────────┐
    │                                 │
 X  │  [U] shop                       │  X
    │                                 │
    └─────────────────────────────────┘
         X
```

This applies in all directions — above, below, left, and right of the full wordmark extent.

### 4.2 App Icon Clearspace

The clearspace unit for the icon alone is **25% of the icon's width** on all four sides.

---

## 5. Minimum Size Rules

Below these sizes, the logo degrades — the gradient becomes muddy, the U letterform loses definition, and the clearspace is impossible to maintain.

### 5.1 Primary Wordmark

| Medium | Minimum Width |
|---|---|
| **Digital (screen)** | 100px wide |
| **Print** | 25mm wide |
| **Large format / outdoor** | 60mm wide (at viewing distance < 2m) |

### 5.2 App Icon / Icon Only

| Medium | Minimum Size |
|---|---|
| **Digital (screen)** | 24×24px (at this size, use the simplified flat version — see §6) |
| **Favicon** | 16×16px minimum (use `favicon.ico` — pre-optimized for this size) |
| **App store icon** | 1024×1024px (use the provided high-res asset only) |
| **Print** | 8mm × 8mm |

### 5.3 The Simplified Icon Rule

At 32px and below on screen, or 10mm and below in print, the gradient shopping cart icon loses legibility. At these sizes, use the **simplified flat icon variant** (`logo-icon-flat.svg`) — a solid single-color version of the cart mark in `#D4009B`. This variant exists in the source files. Do not create your own simplified version.

---

## 6. Approved Color Configurations

The logo is approved for use in the following configurations. Any configuration not on this list is not approved.

| Configuration | Background | Use When |
|---|---|---|
| **Full color (standard)** | White `#FFFFFF` | Preferred. Most marketing, web headers on light backgrounds |
| **Full color on dark** | Dark backgrounds `#0A0A0A → #1E2130` | In-app header, dark marketing materials |
| **All-white (reversed)** | Dark backgrounds or dark photography | When gradient would lose legibility against colored backgrounds |
| **All-black (reversed)** | White or light backgrounds | Monochrome print, legal documents, watermarks |
| **All-white (icon only)** | Any dark or colored background | App icon on colored backgrounds, favicon alt |
| **Gradient on transparent** | None (transparent PNG) | Digital placements where the designer controls the background |

**The all-white reversed logo:** Both the U-block (normally red) and the "shop" text (normally gradient) render in pure white `#FFFFFF`. The block outline disappears — the U letterform sits in negative space against the dark background.

---

## 7. The Do Not List — Exhaustive

These are violations. If you see a logo being used in any of these ways, correct it immediately.

### 7.1 Color & Gradient Violations

| ❌ Violation | Why it's wrong |
|---|---|
| Changing the U-block from Signature Red to any other color (purple, black, gradient) | The red block is the anchor of the identity. Changing it destroys the contrast and meaning of the mark. |
| Reversing the gradient direction (magenta to purple) | The gradient direction is part of the visual vocabulary. Reversing it creates an unrecognized mark. |
| Applying the brand gradient to the U-block instead of the wordmark | The gradient belongs to "shop" only. The U-block is always flat red. |
| Replacing the gradient with a solid color for the "shop" wordmark | The gradient is the wordmark. A solid-color version in any single hue does not exist. |
| Using opacity on the logo for a "ghost" or "watermark" effect | The logo at reduced opacity becomes indistinct and unreadable. Use the all-white or all-black variant instead. |
| Applying a drop shadow to the wordmark | Shadows degrade the crispness of the gradient text. Use clearspace and background contrast instead. |
| Using any color configuration not listed in §6 | Unapproved configurations compromise brand consistency. |

### 7.2 Geometry & Proportion Violations

| ❌ Violation | Why it's wrong |
|---|---|
| Stretching or compressing the logo horizontally or vertically | Distorts letterforms and destroys proportional relationships within the mark. |
| Scaling the U-block and wordmark independently | The size relationship between block and wordmark is fixed. They cannot be adjusted separately. |
| Making the U-block rectangular (taller or wider than square) | The square is a deliberate geometric choice. A rectangle reads as a flag, not a block. |
| Rounding the corners of the U-block | The sharp corners are intentional. Rounded corners soften the mark inappropriately. |
| Rotating the logo by any degree | The logo is not designed to work at angles. It is a horizontal mark. |
| Repeating the logo as a pattern/wallpaper texture | The logo contains fine gradient details that become noise at pattern scale. Use simple geometric patterns from the brand pattern system instead. |

### 7.3 Composition & Placement Violations

| ❌ Violation | Why it's wrong |
|---|---|
| Placing the logo over a photo with variable contrast across the logo area | Parts of the logo will disappear. Use a solid color bar behind the logo, or use the reversed white variant. |
| Placing the full-color logo on a colored background (anything other than white or approved darks) | The red block clashes with most colors. The gradient becomes illegible. Use an approved configuration. |
| Placing any other element — text, badge, icon — within the clearspace zone | Violates visual breathing room and competes for attention with the mark. |
| Placing the logo in a corner without clearspace from the edge | The logo must have full clearspace even from page/screen edges. |
| Using the wordmark and app icon simultaneously in close proximity as separate elements | They are not designed to coexist as separate elements. Use one or the other for each placement. |
| Adding any tagline, descriptor, or additional text to the wordmark | The wordmark is self-contained. "U-Shop — Ghana's Trusted Tech Marketplace" does not appear as part of the logo. Taglines are set separately in body type. |

### 7.4 Animation & Digital Violations

| ❌ Violation | Why it's wrong |
|---|---|
| Animating the gradient (color-shifting, cycling, or pulsing the gradient) | The gradient is static in the logo. Animated gradients in UI elements are separate from the logo and must not feature the logo itself. |
| Adding a glow or neon effect to the wordmark | The app icon has a neon treatment. The wordmark does not. Applying it to the wordmark creates inconsistency between the two marks. |
| Using a low-resolution raster file at large sizes | Always use SVG or the highest-resolution PNG provided. Never scale a small PNG up. |
| Recreating the logo in any design tool from scratch | The source files are the logo. Hand-drawn reconstructions will never match the optical corrections in the original files. |

### 7.5 Lockup & Context Violations

| ❌ Violation | Why it's wrong |
|---|---|
| Placing competitor logos in closer proximity to U-Shop's logo than clearspace rules allow | Creates an implicit visual comparison or partnership. |
| Using the logo in a context that implies a partnership, endorsement, or investment that has not been authorized | The logo is not a general endorsement mark. |
| Modifying the logo for seasonal or holiday campaigns (adding Santa hats, hearts, etc.) | Decorating the logo is never appropriate. Create campaign artwork that lives *beside* the logo, not on it. |
| Using the logo as a link to any page other than the U-Shop homepage | The logo in a web header always links to `ushop.com`. No exceptions. |

---

## 8. Partner & Third-Party Logo Use

When external partners (universities, media outlets, payment processors) need to use the U-Shop logo:

1. Direct them to the official press kit at `[press.ushop.com]` or the designated PR contact.
2. The all-white or full-color-on-white versions are appropriate for co-branding contexts.
3. Partners may never modify the logo. They may only use provided files as supplied.
4. Usage in press contexts: Logo must appear no smaller than 25mm / 100px and must be accompanied by the full wordmark (not icon only), unless icon-only is explicitly required by the medium (e.g., social media profile picture).
5. Any commercial or sponsored use of the logo requires a signed co-branding agreement.

---

## 9. Asset File Reference

All assets are maintained at `/brand/assets/logo/`. The authoritative source is the Figma file linked in the team workspace.

| File | Format | Use |
|---|---|---|
| `logo-primary.svg` | SVG | Primary digital use — all sizes |
| `logo-primary-light.svg` | SVG | All-white reversed version |
| `logo-primary-dark.svg` | SVG | All-black version |
| `logo-primary-1000w.png` | PNG (1000px) | Marketing, press, presentations |
| `logo-primary-500w.png` | PNG (500px) | Web use |
| `logo-primary-150w.png` | PNG (150px) | Compact web use |
| `logo-icon.svg` | SVG | App icon — scalable |
| `logo-icon-flat.svg` | SVG | Simplified flat icon for small sizes |
| `logo-icon-1024.png` | PNG (1024px) | App store submission |
| `android-chrome-192x192.png` | PNG (192px) | Android home screen |
| `android-chrome-512x512.png` | PNG (512px) | Android splash / high-DPI |
| `apple-touch-icon.png` | PNG (180px) | iOS home screen |
| `favicon-32x32.png` | PNG (32px) | Browser tab (standard) |
| `favicon-16x16.png` | PNG (16px) | Browser tab (compact) |
| `favicon.ico` | ICO | Browser tab (legacy) |
| `logo-cmyk.pdf` | PDF | Print production — CMYK color space |
| `logo-primary.eps` | EPS | Legacy print production |

---

*Logo assets are version-controlled. Do not modify files in the `/brand/assets/` directory directly. Submit a brand design request if new asset sizes or configurations are needed.*
