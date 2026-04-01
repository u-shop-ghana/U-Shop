# U-Shop Color Palette
**Version:** 1.0.0 | **Owner:** Brand & Design | **Status:** Active

> **Source of Truth:** All color values in this document were sampled directly from
> approved logo assets (`logo-1000w.png`, `android-chrome-192x192.png`) and the
> confirmed design system token file. These values supersede any values in older
> documents, Figma files, or verbal descriptions that differ from what is written here.
>
> **A note on a common misquote:** The "U" block in the logo is **Signature Red**
> (`#E8000B`), not orange. The "shop" wordmark runs a **Purple → Magenta** gradient,
> not orange → magenta. This distinction matters. Document it accurately.

---

## 1. Brand Color Tokens

### 1.1 The Primary Palette

These are the four non-negotiable colors of the U-Shop identity. Every other color in the system derives from or defers to these.

---

#### Signature Red — `$ushop-red`

The anchor color. The "U" block in the logo. The most attention-demanding element in our visual identity. It conveys urgency, energy, and the assertive confidence of a brand that knows what it is.

| Format | Value |
|---|---|
| **HEX** | `#E8000B` |
| **RGB** | `rgb(232, 0, 11)` |
| **HSL** | `hsl(357, 100%, 46%)` |
| **Tailwind config key** | `ushop-red` |
| **CSS Custom Property** | `--color-ushop-red: #E8000B;` |

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'ushop-red': '#E8000B',
    }
  }
}
```

**Usage:** Logo U-block only. Critical error states. "Danger" action buttons (delete, permanent action). Sale badges. Never use as a large background color — it is too dominant. Never dilute with opacity for secondary uses; use Semantic Error Red instead (see §3).

---

#### Brand Purple — `$ushop-purple`

The start point of the "shop" gradient and the primary action color for all interactive UI elements. Deep, authoritative, and distinctive in a market where most competitors use blue or green.

| Format | Value |
|---|---|
| **HEX** | `#6B1FA8` |
| **RGB** | `rgb(107, 31, 168)` |
| **HSL** | `hsl(277, 69%, 39%)` |
| **Tailwind config key** | `ushop-purple` |
| **CSS Custom Property** | `--color-ushop-purple: #6B1FA8;` |

**Usage:** Primary action buttons (standalone, non-gradient). Active navigation states. Progress indicators. Input focus rings. Link colors on dark backgrounds. Icon fills for primary features.

---

#### Brand Magenta — `$ushop-magenta`

The end point of the "shop" gradient. Hot, electric, and impossible to ignore. This is the color that reads as "new," "exciting," and "tech-forward" to a Gen Z audience.

| Format | Value |
|---|---|
| **HEX** | `#D4009B` |
| **RGB** | `rgb(212, 0, 155)` |
| **HSL** | `hsl(314, 100%, 42%)` |
| **Tailwind config key** | `ushop-magenta` |
| **CSS Custom Property** | `--color-ushop-magenta: #D4009B;` |

**Usage:** Secondary actions. Notification dots. Highlight accents on dark surfaces. Gradient endpoints. Feature callouts. The color buyers associate with "something exciting is happening."

---

#### Pure White — `$ushop-white`

Not `#FFFFFF` by default in all contexts — see Ink White below for text on dark backgrounds. Pure white is reserved for high-contrast backgrounds and logo lockups.

| Format | Value |
|---|---|
| **HEX** | `#FFFFFF` |
| **RGB** | `rgb(255, 255, 255)` |
| **Tailwind config key** | `white` (native Tailwind) |
| **CSS Custom Property** | `--color-ushop-white: #FFFFFF;` |

---

### 1.2 The Signature Gradient

The gradient is the U-Shop visual signature. It appears in the logo wordmark, primary CTAs, hero section decorative elements, and promotional badges. It is always directional — left to right, purple to magenta.

| Property | Value |
|---|---|
| **Direction** | `90deg` (left → right) or `135deg` for diagonal decorative use |
| **Start color** | `#6B1FA8` (Brand Purple) |
| **End color** | `#D4009B` (Brand Magenta) |
| **CSS** | `linear-gradient(90deg, #6B1FA8, #D4009B)` |
| **CSS Custom Property** | `--gradient-brand: linear-gradient(90deg, #6B1FA8, #D4009B);` |
| **Tailwind utility class** | `bg-gradient-to-r from-ushop-purple to-ushop-magenta` |

```js
// tailwind.config.js — backgroundImage extension
theme: {
  extend: {
    backgroundImage: {
      'ushop-gradient': 'linear-gradient(90deg, #6B1FA8, #D4009B)',
      'ushop-gradient-diagonal': 'linear-gradient(135deg, #6B1FA8, #D4009B)',
    }
  }
}
```

**The gradient applies to:**
- Logo "shop" wordmark text (via `-webkit-background-clip: text`)
- Primary call-to-action buttons (full background)
- Hero section decorative lines and shapes
- "Verified Seller" badge backgrounds
- Progress bar fills (escrow progress, upload progress)
- Hover states on featured product cards (border glow)

**The gradient never applies to:**
- Body text of any length
- Error messages or warning states
- Navigation links
- Form inputs
- Tables or data-dense components

---

## 2. Dark Background System

U-Shop is designed dark-first. Our dark backgrounds are not simply "black with opacity" — they are a deliberate system of layered depth. Each level has a specific semantic role.

### 2.1 Background Layers

| Role | Name | HEX | RGB | CSS Custom Property |
|---|---|---|---|---|
| **Page background** | Ink Void | `#0A0A0A` | `rgb(10, 10, 10)` | `--bg-void` |
| **Primary surface** | Ink Deep | `#0D0E11` | `rgb(13, 14, 17)` | `--bg-deep` |
| **Elevated surface** | Ink Dark | `#13151A` | `rgb(19, 21, 26)` | `--bg-dark` |
| **Card / panel** | Ink Mid | `#1A1D25` | `rgb(26, 29, 37)` | `--bg-mid` |
| **Input / control** | Ink Surface | `#1E2130` | `rgb(30, 33, 48)` | `--bg-surface` |
| **Divider / border** | Ink Line | `rgba(255,255,255,0.07)` | — | `--line-subtle` |
| **Active border** | Ink Line Strong | `rgba(255,255,255,0.13)` | — | `--line-strong` |

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'ink': {
        'void':    '#0A0A0A',
        'deep':    '#0D0E11',
        'dark':    '#13151A',
        'mid':     '#1A1D25',
        'surface': '#1E2130',
      }
    }
  }
}
```

### 2.2 How Layers Stack

```
Page (ink-void #0A0A0A)
  └── App shell / sidebar (ink-deep #0D0E11)
        └── Section container (ink-dark #13151A)
              └── Card / panel (ink-mid #1A1D25)
                    └── Input / dropdown (ink-surface #1E2130)
```

This stacking creates visual depth without using opacity hacks or box shadows as the primary depth signal. Each layer is 4–8 points lighter than the one beneath it.

---

## 3. Semantic UI Colors (Dark-Mode First)

These colors exist for functional communication. They are not brand colors — they are system colors. They must meet WCAG AA contrast (4.5:1) against all ink backgrounds.

### 3.1 Semantic Token Reference

| Semantic Role | Name | HEX | Usage |
|---|---|---|---|
| **Success** | Emerald | `#22C55E` | Order confirmed, payment received, verification approved, escrow released |
| **Success (muted bg)** | Emerald Ghost | `rgba(34,197,94,0.12)` | Success state card backgrounds, toast backgrounds |
| **Warning** | Amber | `#F59E0B` | Escrow reminder, pending verification, low stock, approaching deadline |
| **Warning (muted bg)** | Amber Ghost | `rgba(245,158,11,0.12)` | Warning toast backgrounds, alert panels |
| **Error** | Rose | `#F43F5E` | Payment failed, dispute opened, validation error, critical system alert |
| **Error (muted bg)** | Rose Ghost | `rgba(244,63,94,0.10)` | Error card backgrounds, inline error messages |
| **Info** | Sky | `#3B82F6` | Neutral information, help tooltips, educational prompts |
| **Info (muted bg)** | Sky Ghost | `rgba(59,130,246,0.10)` | Info toast backgrounds |
| **Paystack** | Paystack Teal | `#00C3F7` | Paystack-specific UI elements, payment method badges |
| **MoMo** | MoMo Gold | `#FFCC00` | MTN MoMo payment method indicator only |

### 3.2 Text Colors on Dark Backgrounds

| Role | Name | HEX | CSS Property | Usage |
|---|---|---|---|---|
| **Primary text** | Ink Text | `#E8E8F0` | `--text-primary` | Headlines, body copy, primary labels |
| **Secondary text** | Ink Soft | `#B0B3C4` | `--text-secondary` | Descriptions, subtitles, supporting info |
| **Muted text** | Ink Muted | `#7A7D8E` | `--text-muted` | Placeholders, timestamps, metadata |
| **Disabled text** | Ink Ghost | `#4A4D5E` | `--text-disabled` | Disabled states, inactive labels |

---

## 4. Full Tailwind Configuration

This is the complete color extension block for `tailwind.config.js`. Copy it verbatim.

```js
// tailwind.config.js
const config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand Core ──────────────────────────────────────────────────
        'ushop-red':     '#E8000B',   // Signature red — U-block, danger actions
        'ushop-purple':  '#6B1FA8',   // Brand purple — primary actions
        'ushop-magenta': '#D4009B',   // Brand magenta — secondary, highlights

        // ── Dark Backgrounds ────────────────────────────────────────────
        'ink': {
          'void':    '#0A0A0A',
          'deep':    '#0D0E11',
          'dark':    '#13151A',
          'mid':     '#1A1D25',
          'surface': '#1E2130',
        },

        // ── Text ────────────────────────────────────────────────────────
        'ink-text':     '#E8E8F0',
        'ink-soft':     '#B0B3C4',
        'ink-muted':    '#7A7D8E',
        'ink-disabled': '#4A4D5E',

        // ── Semantic ────────────────────────────────────────────────────
        'status': {
          'success':  '#22C55E',
          'warning':  '#F59E0B',
          'error':    '#F43F5E',
          'info':     '#3B82F6',
        },

        // ── Partners ────────────────────────────────────────────────────
        'paystack':     '#00C3F7',
        'momo':         '#FFCC00',
      },

      backgroundImage: {
        'ushop-gradient':          'linear-gradient(90deg, #6B1FA8, #D4009B)',
        'ushop-gradient-diagonal': 'linear-gradient(135deg, #6B1FA8, #D4009B)',
        'ushop-gradient-vertical': 'linear-gradient(180deg, #6B1FA8, #D4009B)',
      },
    },
  },
};

module.exports = config;
```

---

## 5. Color Psychology: Why These Colors for This Market

### 5.1 Red (`#E8000B`) — The Anchor of Urgency

Red is the most attention-capturing color in the human visual system. In the context of high-value tech commerce, it communicates one thing loudly: *this matters.* The "U" block being red is not accidental — it tells the eye where to look first, every time, at any size. In the Ghanaian consumer context, red carries cultural associations with strength and decisiveness. It is the color of action.

The risk of red is aggression. We mitigate this by using it structurally (the logo block) rather than decoratively — it is architectural, not emotional.

### 5.2 Purple (`#6B1FA8`) — Authority and Premium

Purple has been the color of quality and status across cultures for centuries. In the context of West African markets, where brand trust is earned against a backdrop of rampant counterfeit goods, purple signals that we are not a discount alternative. We are the premium, trusted channel. Deep purple reads as intelligent and discerning — the platform that has thought carefully about how it operates.

Gen Z globally has strong positive associations with purple (gaming, streaming, creative tech) — it is distinctly digital in connotation.

### 5.3 Magenta (`#D4009B`) — Energy and the Digital Native

Hot magenta is the color of the internet. It appears in major tech brands globally (T-Mobile, Adobe, Neon signs in streetwear culture). For our Gen Z demographic, it reads as energetic, bold, and unashamed of being visible. It is the color that says "we are not trying to blend in."

The purple-to-magenta gradient bridges the tension between our two audiences perfectly: the purple anchors trust for buyers making large purchases, and the magenta end signals the energy and modernity that sellers want to be associated with.

### 5.4 Dark Backgrounds — Trust Through Professionalism

Light-on-dark interfaces signal sophistication and intentionality to digital-native users. They say: *we designed this carefully.* In a market where most competitors look like 2012 classifieds sites, our dark UI is an immediate differentiator. It also causes our gradient colors to pop with maximum vibrancy — the same purple and magenta that would look muted on white backgrounds become electric against `#0D0E11`.

The layered dark system specifically avoids pure black, which reads as harsh and claustrophobic. Our backgrounds are deep charcoals with a subtle blue undertone — they feel expansive, not heavy.

---

## 6. Color Accessibility Standards

All text on dark backgrounds must meet **WCAG AA minimum contrast of 4.5:1**. Heading text must meet **AAA (7:1) where possible.**

| Text Color | Background | Contrast Ratio | Standard Met |
|---|---|---|---|
| `#E8E8F0` on `#0D0E11` | Ink Text on Ink Deep | ~13.8:1 | AAA ✓ |
| `#B0B3C4` on `#1A1D25` | Ink Soft on Ink Mid | ~6.8:1 | AA ✓ |
| `#7A7D8E` on `#1A1D25` | Ink Muted on Ink Mid | ~3.2:1 | Decorative use only |
| `#22C55E` on `#0D0E11` | Success on Ink Deep | ~8.5:1 | AAA ✓ |
| `#F43F5E` on `#0D0E11` | Error on Ink Deep | ~6.2:1 | AA ✓ |
| `#FFFFFF` on `#6B1FA8` | White on Purple | ~7.8:1 | AAA ✓ |
| `#FFFFFF` on `#D4009B` | White on Magenta | ~4.9:1 | AA ✓ |
| `#FFFFFF` on gradient | White on Gradient | ~4.9:1 min | AA ✓ |

**The rule:** If you cannot confirm the contrast ratio, do not ship it. Use the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or the Figma A11y plugin before any new color combination enters production.

---

*Color tokens are maintained in `src/styles/tokens.css`. Any change to a token value requires a brand design review and a CHANGELOG entry.*
