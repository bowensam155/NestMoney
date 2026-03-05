# NestMoney — Design Language
**Version:** 0.1  
**Last Updated:** March 2026

> This document defines the visual and UX language for NestMoney. Every UI component, screen, and interaction should be built against these standards. Reference this file in Cursor when building any frontend work.

---

## Core Feeling

**"Calm confidence."**

NestMoney should feel like a knowledgeable friend, not a bank. Warm but not childish. Simple but not dumbed down. If a Filipino grandmother and her teenage granddaughter can both open the app and immediately understand what they're looking at — we got it right.

Finance is already stressful for our users. The app should feel like relief the moment it opens.

---

## Color

### Palette

| Role | Value | Usage |
|---|---|---|
| Primary Accent | `#F97316` (Saffron Orange) | Primary buttons, active tab, key highlights |
| Primary Dark | `#1E293B` (Dark Navy) | Headers, important text |
| Background | `#FFFFFF` (White) | Screen backgrounds |
| Surface | `#F8FAFC` (Warm Light Gray) | Cards, input backgrounds |
| Border | `#E2E8F0` | Card borders, dividers |
| Text Primary | `#1E293B` | Main body text |
| Text Secondary | `#94A3B8` | Labels, captions, secondary info |
| Text Disabled | `#CBD5E1` | Disabled states |
| Success | `#22C55E` | Positive transactions, goals met |
| Warning | `#EAB308` | Low balance, pending approvals |
| Danger | `#EF4444` | Declined transactions, errors |
| Chart Fill | `#C7D2FE` (Soft Lavender) | Default chart bars |
| Chart Highlight | `#F97316` | Active/selected chart bar |

### Rules
- **One accent color only.** Never use multiple bold colors competing for attention.
- **White backgrounds dominate.** The UI breathes. Avoid filling space with color.
- **Data is the hero.** Large numbers and balances should be the most visually prominent element on any financial screen.
- **Never dark mode as primary.** Our users check balances in bright daylight, on older phones, in quick moments between tasks.

---

## Typography

### Font
**System font stack** — SF Pro on iOS, Roboto on Android. For non-Latin scripts, Noto Sans variants (see i18n/fonts.ts).

### Scale

| Role | Size | Weight | Color | Usage |
|---|---|---|---|---|
| Display | 32px | Bold (700) | `#1E293B` | Balance amounts, hero numbers |
| Heading 1 | 24px | Bold (700) | `#1E293B` | Screen titles |
| Heading 2 | 20px | SemiBold (600) | `#1E293B` | Section headers |
| Heading 3 | 17px | SemiBold (600) | `#1E293B` | Card titles, list headers |
| Body | 15px | Regular (400) | `#1E293B` | Main content |
| Body Small | 13px | Regular (400) | `#94A3B8` | Secondary info, captions |
| Label | 11px | Medium (500) | `#94A3B8` | Tags, badges, timestamps |
| Button | 16px | SemiBold (600) | `#FFFFFF` | Button text |

### Rules
- **Numbers are always larger than their labels.** "$1,250.00" should dominate over "Total Balance"
- **No more than two font sizes on a single card.** Keep it scannable.
- **Non-Latin scripts:** Use the appropriate Noto Sans variant. Never let a script fall back to a system default — verify on Android specifically.

---

## Spacing & Layout

### Base Unit
`4px` — all spacing is a multiple of 4.

### Common Values
| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Tight internal padding |
| `sm` | 8px | Component internal spacing |
| `md` | 16px | Standard padding, card padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Screen-level top padding |
| `xxl` | 48px | Hero section spacing |

### Screen Layout
- Horizontal screen padding: `16px` on all screens
- Bottom safe area: always respect device safe area insets (use `useSafeAreaInsets`)
- Cards never touch the screen edge — always `16px` margin

---

## Components

### Cards
The primary container for all financial information.

```
Background: #FFFFFF
Border radius: 16px
Shadow: 0px 1px 3px rgba(0,0,0,0.08), 0px 4px 12px rgba(0,0,0,0.04)
Padding: 16px
Margin bottom: 12px
```

- Cards never have colored backgrounds — always white
- Information inside cards follows the type scale strictly
- The most important number on a card is always the largest element

### Buttons

**Primary Button**
```
Background: #F97316
Text: #FFFFFF, 16px SemiBold
Border radius: 100px (full pill)
Height: 52px
Padding horizontal: 24px
```

**Secondary Button**
```
Background: #F8FAFC
Text: #1E293B, 16px SemiBold
Border: 1px solid #E2E8F0
Border radius: 100px
Height: 52px
```

**Destructive Button**
```
Background: #FEF2F2
Text: #EF4444, 16px SemiBold
Border radius: 100px
Height: 52px
```

**Ghost / Text Button**
```
Background: transparent
Text: #F97316, 16px SemiBold
No border
```

### Input Fields
```
Background: #F8FAFC
Border: 1px solid #E2E8F0
Border radius: 12px
Height: 52px
Padding horizontal: 16px
Font: 15px Regular #1E293B
Focus border: #F97316
```

### Avatars
- Always circular
- Real photos where available
- Fallback: initials on a soft colored background (derived from name, not random)
- Sizes: 32px (list), 40px (card), 56px (profile header)

### Bottom Tab Bar
```
Background: #FFFFFF
Border top: 1px solid #E2E8F0
Icon size: 24px
Active color: #F97316
Inactive color: #94A3B8
Label: 10px Medium
Height: 60px + safe area inset
```

### Charts (Bar Charts)
- Rounded bars — `border-radius: 6px` on top corners
- Default fill: `#C7D2FE` (soft lavender)
- Active/selected bar: `#F97316` (primary accent)
- No grid lines — clean white background only
- Y-axis labels: Body Small (`#94A3B8`)
- X-axis labels: Label (`#94A3B8`)
- Never use sharp-cornered bars — they feel corporate and harsh

### Bottom Sheets / Modals
Used for the AI explainer, approval flows, and contributor flows.

```
Background: #FFFFFF
Border radius top: 24px
Handle bar: 4px x 36px, #E2E8F0, centered, 8px from top
Padding: 24px
```

- Always use bottom sheets over full-screen modals for quick actions
- Full-screen modals only for multi-step flows (onboarding, invite)

---

## Illustration & Iconography

### Icons
Use **Lucide Icons** — clean, consistent, modern line icons. Already available in the Expo/React Native ecosystem.

- Stroke width: 1.5px
- Size: 24px standard, 20px in lists, 16px inline
- Color: matches text context (`#1E293B` primary, `#94A3B8` secondary, `#F97316` active)

### Illustrations
Used for empty states, onboarding, and celebration moments.

- Style: Modern line-art with soft color fills
- Tone: Warm, human, relatable — not corporate stock art
- Characters: Diverse, reflecting our actual user base (Filipino, Latino, South Asian families)
- Source: Generate with AI (Midjourney / DALL-E) or use [Storyset](https://storyset.com) / [unDraw](https://undraw.co) as base
- Never use generic "person at computer" tech illustrations

### Celebration Moments
When a savings goal is hit, a kid earns a milestone, or a family completes onboarding:
- Confetti animation (use `react-native-confetti-cannon`)
- Large friendly illustration
- Short celebratory message in the user's language
- These moments matter — our users don't get celebrated by financial products. Make it feel earned.

---

## Motion & Animation

### Principles
- **Functional, not decorative.** Animation should communicate state change, not show off.
- **Fast.** Target users are busy. Nothing over 300ms for transitions.
- **Subtle.** Micro-animations on button press, card load, balance reveal. Nothing flashy.

### Standard Durations
| Type | Duration | Easing |
|---|---|---|
| Button press feedback | 100ms | ease-in-out |
| Screen transition | 250ms | ease-in-out |
| Bottom sheet open | 300ms | spring (damping 20) |
| Card load skeleton | 800ms | linear (loop) |
| Celebration | 1200ms | spring |

### Loading States
- Use skeleton screens, not spinners, for content loading
- Skeleton color: `#F1F5F9` animated to `#E2E8F0`
- Never show a blank white screen while data loads

---

## Accessibility

- **Minimum touch target: 44x44px** — even for small elements
- **Color contrast:** All text must meet WCAG AA (4.5:1 ratio minimum)
- **Never rely on color alone** to communicate state — always pair with an icon or label
- **Font scaling:** Respect the user's system font size setting — use relative units
- **Screen reader labels** on all interactive elements — our users may have varying digital literacy

---

## Design Anti-Patterns

Things we explicitly do not do:

- ❌ Dark backgrounds as primary UI
- ❌ More than one accent color competing for attention
- ❌ Tiny text to fit more information — simplify the information instead
- ❌ Sharp-cornered cards or buttons — always rounded
- ❌ Generic stock photography
- ❌ Walls of text — if it needs more than 3 lines to explain, it needs a video or redesign
- ❌ Hiding important numbers behind taps — balances and key info should be visible immediately
- ❌ Intimidating financial jargon in the UI — if a term needs explanation, it shouldn't be a label

---

## Reference Screens

The design language is inspired by these UI patterns (saved in `assets/design-reference/`):

- **NationRemit referral screen** — clean white layout, pill buttons, rounded bar charts with single accent highlight, large metric numbers
- **Frindle social app** — warm orange accent, circular avatars, bottom tab navigation, card-based feed layout, rounded corners throughout

These are reference only — do not copy layouts directly. Extract the *feeling*: approachable, warm, clean, data-forward.

---

*Every screen built for NestMoney should pass this test: could a first-generation immigrant mother, tired after a long day, open this screen and understand what she's looking at in under 5 seconds — in her language? If not, simplify.*
