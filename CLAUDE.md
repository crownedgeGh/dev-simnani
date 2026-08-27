# Simnani Estate — Claude Rules

> **Read every section top to bottom before writing a single line of code.**
> This is the complete, self-contained ruleset for Claude working in this repository.
> It covers every convention, pattern, and gotcha you need to know.

---

## 1. Stack & Versions

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.2 |
| Runtime | React | 19.2.8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) | ^4 |
| Icons | **react-icons** | latest |
| Language | JavaScript (JSX) — **no TypeScript** | — |
| Package manager | npm | — |

### Critical Next.js 16 notes
- **Read `node_modules/next/dist/docs/`** before using any Next.js API. v16 breaks a lot compared to your training data.
- `app/` directory — **App Router exclusively**. Never create a `pages/` directory.
- Server Components are the default. Add `"use client"` only for: browser APIs, `useState`, `useEffect`, `useContext`, event handlers.
- Images: always `next/image`. `images.unsplash.com` is whitelisted in `next.config.mjs`.
- Fonts: pre-loaded in `app/layout.js` via `next/font/google`. **Never re-import fonts in components.**

---

## 2. Design System — Theme Is Law

Every color and font comes from `app/globals.css` (`@theme inline`). The single rule:

> **Never write a raw hex value like `#ffc633` or `rgba(255,198,51,…)` in a `className`.  
> When an inline style is unavoidable (animation, dynamic value), use `var(--color-gold-400)` not the hex.**

### Full Color Palette

| Token name | Tailwind class | CSS variable | Hex | When to use |
|---|---|---|---|---|
| Background | `bg-navy-950` | `--color-navy-950` | `#05070c` | Page bg, deepest surface |
| Surface | `bg-navy-900` | `--color-navy-900` | `#0a0e1a` | Cards, panels, modals |
| Subtle border | `border-navy-800` | `--color-navy-800` | `#111a2c` | Hairline dividers |
| Default border | `border-navy-700` | `--color-navy-700` | `#1b2740` | Most borders |
| Hover border | `border-navy-600` | `--color-navy-600` | `#2a3a58` | Border on hover |
| Primary text | `text-cream` | `--color-cream` | `#f5f1e8` | Body copy, headings |
| Secondary text | `text-muted` | `--color-muted` | `#9aa3b8` | Labels, captions, placeholders |
| **Gold accent** | `text-gold-400` | `--color-gold-400` | `#ffc633` | **CTAs, prices, highlights, links** |
| Gold hover | `text-gold-300` | `--color-gold-300` | `#ffde85` | Gold hover state |
| Gold active | `text-gold-500` | `--color-gold-500` | `#f5b400` | Gold active/pressed |
| Gold dark | `text-gold-600` | `--color-gold-600` | `#d19700` | Rare dark accent |
| Gold deeper | `text-gold-700` | `--color-gold-700` | `#a87900` | Very rare, strong contrast |

> **Background variants:** `bg-gold-400`, `bg-gold-500`, `bg-navy-900`, `bg-navy-950` etc. also work for backgrounds.  
> **Border variants:** `border-navy-700/60` (with opacity) is the most common border pattern.

### Typography

| Purpose | Tailwind class | Font family | Notes |
|---|---|---|---|
| Display / serif headings | `font-display` | Playfair Display | Hero headings, property prices, section titles |
| Body / UI text | `font-sans` | Inter | All body copy, labels, buttons |
| Uppercase tracked label | `tracked-label` | Inter | Nav links, badges, eyebrows — `letter-spacing: 0.16em; text-transform: uppercase` |

**Rules:**
- Use `font-display` for `<h1>`, `<h2>`, property prices, and premium display text.
- Use `tracked-label` for ALL small uppercase labels. Do not recreate it with `tracking-widest uppercase` — use the class.
- `tracked-label` is defined in `globals.css` and works everywhere.

### Common Tailwind Patterns Used in This Project

```jsx
// Card / panel
<div className="border border-navy-700/60 bg-navy-900 rounded-sm">

// Gold CTA button
<button className="tracked-label bg-gold-400 text-navy-950 hover:bg-gold-300 transition px-4 py-2 text-xs">

// Ghost button (bordered)
<button className="tracked-label border border-gold-500/70 text-gold-400 hover:bg-gold-500/10 transition px-4 py-2 text-xs">

// Section eyebrow label
<span className="tracked-label text-xs text-gold-400">Featured Properties</span>

// Muted caption
<p className="text-sm text-muted">Koramangala, Bangalore</p>

// Property price
<p className="font-display text-xl text-gold-400">₹1.25 Cr</p>

// Section heading
<h2 className="font-display text-3xl text-cream sm:text-4xl lg:text-5xl">

// Hover transitions
className="transition hover:text-gold-400 hover:border-gold-500"
```

---

## 3. Icons — react-icons Only

**Use `react-icons` for every icon.** Never write a custom `<svg>` for an icon that exists in the library.

```jsx
// ✅ Correct
import { MdHome, MdAdd, MdSearch } from "react-icons/md";
import { FiUser, FiLock, FiUpload } from "react-icons/fi";
import { BiBuildingHouse, BiArea } from "react-icons/bi";
import { FaWhatsapp, FaInstagram } from "react-icons/fa6";
```

```jsx
// ❌ Wrong — never do this for icons that react-icons covers
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="..." />
</svg>
```

**Preferred sets:**
| Package | Best for |
|---|---|
| `react-icons/md` | General UI (Material Design) |
| `react-icons/fi` | Clean minimal (Feather) |
| `react-icons/bi` | Real estate / property specific |
| `react-icons/fa6` | Social media, misc (Font Awesome 6) |

> **Grandfathered SVGs:** Navbar, Footer, and PropertyCard have hand-rolled SVGs from before this rule was set. Leave them unless explicitly refactoring those files. Never mix approaches in the same file.

Install if missing: `npm install react-icons`

---

## 4. Responsiveness — Mobile-First Always

Every component and page **must look correct at all three breakpoints**:

| Name | Tailwind prefix | Min-width |
|---|---|---|
| Mobile | _(none, default)_ | 0px |
| Tablet | `sm:` | 640px |
| Desktop | `lg:` | 1024px |

### Mandatory patterns

```jsx
// Horizontal padding — always this three-step pattern
className="px-4 sm:px-6 lg:px-8"

// Content max-width — content sections
className="mx-auto max-w-7xl"

// Content max-width — hero / navbar
className="mx-auto max-w-[1400px]"   // hero
className="mx-auto max-w-[1500px]"   // navbar

// Section vertical spacing
className="py-16 sm:py-20 lg:py-24"

// Grid — mobile → tablet → desktop
className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
```

### Rules
- Write mobile styles first, then add `sm:` and `lg:` overrides.
- Touch targets ≥ 44×44px on mobile. Never make buttons too small to tap.
- Navbar hamburger is already implemented — do not break it.
- Auth cards: `max-w-md mx-auto`.
- Test mentally: 375px iPhone → 768px iPad → 1440px desktop.

---

## 5. Project Structure

```
app/                    # Next.js App Router pages & layouts
  globals.css           # ← Tailwind v4 theme — single source of truth
  layout.js             # Root layout: fonts, AuthProvider, Navbar, Footer
  page.js               # Homepage
  [route]/
    page.js             # Each page — lowercase kebab-case route name

components/
  auth/                 # Auth modals, registration wizards, OTP login
  home/                 # Homepage-only sections (Hero, SearchBar, StatsBar…)
  layout/               # Navbar.jsx, Footer.jsx
  portal/               # User dashboard
  project/              # Real estate development cards
  property/             # PropertyCard, forms (Post, Enquiry, Schedule…)

context/
  AuthContext.jsx       # AuthProvider + useAuth() — global auth state

lib/
  auth.js               # Auth helpers
  demoAccount.js        # Demo account fixture data
  demoPortal.js         # Demo portal fixture data
  locations.js          # Locations list
  projects.js           # Projects data
  properties.js         # PROPERTIES array + getPropertiesByType / getFeaturedProperties / getPropertyById
  propertyContent.js    # Property detail content

public/
  useThis.png           # Hero background image
```

### Naming conventions
- Pages → `app/[route]/page.js` (kebab-case directory, always `page.js`)
- Components → PascalCase filename, default export with same name
- Lib files → camelCase
- No `.ts` or `.tsx` — JavaScript only

### `"use client"` — When to add it

| Needs `"use client"` | Does NOT need `"use client"` |
|---|---|
| `useState`, `useEffect`, `useContext` | Purely structural JSX |
| Event handlers (onClick, onChange…) | Static sections receiving props |
| Browser APIs (localStorage, window…) | `lib/` data files |
| `useRouter`, `usePathname` | `app/layout.js` (but its children may need it) |

**Always `"use client"`:** AuthProvider, AuthGateModal, Navbar, all forms, all wizards.

---

## 6. Auth System

Custom client-side auth. No NextAuth, no Clerk, no third-party library.

### Files
| File | Purpose |
|---|---|
| `context/AuthContext.jsx` | `AuthProvider` component + `useAuth()` hook |
| `lib/auth.js` | Auth helper utilities |
| `components/auth/AuthCard.jsx` | OTP mobile login UI |
| `components/auth/AuthGateModal.jsx` | "Members Only" gate modal |
| `components/auth/AccountTypeSelect.jsx` | Registration step 1 |
| `components/auth/BuyerRegistrationWizard.jsx` | Buyer multi-step form |
| `components/auth/BrokerRegistrationWizard.jsx` | Broker multi-step form |
| `components/auth/InvestorRegistrationWizard.jsx` | Investor multi-step form |
| `components/auth/FreelancerRegistrationWizard.jsx` | Freelancer multi-step form |
| `components/auth/inputStyles.js` | Shared form input class strings |

### Using auth in a component
```jsx
"use client";
import { useAuth } from "@/context/AuthContext";

export default function MyComponent() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  // ...
}
```

- `useAuth()` throws if called outside `<AuthProvider>`. Since AuthProvider is in `layout.js`, it always wraps page components — safe to use anywhere in a page or component tree.
- Auth state: `se_auth_token` in `localStorage`. `login(token)` sets it, `logout()` removes it.

### Protecting an action (AuthGateModal pattern)
```jsx
"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";

export default function MyComponent() {
  const { isAuthenticated } = useAuth();
  const [showAuthGate, setShowAuthGate] = useState(false);

  function handleProtectedAction() {
    if (isAuthenticated) {
      // do the thing
    } else {
      setShowAuthGate(true);
    }
  }

  return (
    <>
      <AuthGateModal isOpen={showAuthGate} onClose={() => setShowAuthGate(false)} />
      <button onClick={handleProtectedAction}>Protected Action</button>
    </>
  );
}
```

---

## 7. Shared Input Styles

All form inputs must use the shared constants from `components/auth/inputStyles.js`:

```js
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
```

What they enforce:
- `h-14` height for inputs and selects
- `border border-navy-700/60` default border
- `bg-navy-950` background
- `text-cream placeholder:text-muted`
- `focus:border-gold-400` focus ring
- `outline-none transition`

Never recreate these styles ad-hoc — always import them.

---

## 8. Property Data

```js
// lib/properties.js exports:
import {
  PROPERTIES,              // full array
  getPropertiesByType,     // getPropertiesByType("buy" | "sell" | "rent" | "invest")
  getFeaturedProperties,   // returns properties with featured: true
  getPropertyById,         // getPropertyById("buy-1")
} from "@/lib/properties";
```

- Property types: `"buy"`, `"sell"`, `"rent"`, `"invest"`
- Property detail pages: `/property/[id]`
- Unsplash image format: `https://images.unsplash.com/photo-xxx?w=1200&q=80&auto=format&fit=crop`
- Property IDs in PostPropertyForm: format `SG-PROP-XXXXXX` — generate inside `useEffect` (never in render)

---

## 9. Common Pitfalls — Read Before Writing Code

### Hydration mismatches (the most frequent bug)
```jsx
// ❌ BREAKS SSR — Math.random() differs between server and client
const id = `SG-PROP-${Math.floor(Math.random() * 1000000)}`;

// ✅ Safe — runs only on client
const [id, setId] = useState("");
useEffect(() => {
  setId(`SG-PROP-${Math.floor(Math.random() * 1000000).toString().padStart(6, "0")}`);
}, []);
```

Other hydration triggers to avoid:
- `Date.now()` in render
- `typeof window !== "undefined"` branches that affect JSX
- Locale-sensitive `Date` formatting in client components

`new Date().getFullYear()` in Footer is OK because Footer is a **Server Component** — no hydration.

### Inline styles — when acceptable
| Use inline style for | Use Tailwind class for |
|---|---|
| Animation `@keyframes` in `<style>` tags | Static colors and spacing |
| `backdropFilter` (not in v4 by default) | Hover / focus states |
| Truly dynamic runtime values | Everything else |

When you must use a color in inline style: `var(--color-gold-400)` not `#ffc633`.

### Anti-patterns to never do
```jsx
// ❌ Hardcoded hex in className
<div className="text-[#ffc633]">

// ❌ Re-importing fonts
import { Playfair_Display } from "next/font/google"; // already in layout.js

// ❌ pages/ directory
// Create app/route/page.js, never pages/route.js

// ❌ TypeScript
// .ts, .tsx files don't exist in this project

// ❌ Raw SVG for an existing icon
<svg>...</svg>  // use react-icons instead

// ❌ Non-responsive — no breakpoints
<div className="grid grid-cols-3">  // should be grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

---

## 10. Routes Map

| URL | File | Auth required |
|---|---|---|
| `/` | `app/page.js` | No |
| `/auth` | `app/auth/page.js` | No |
| `/auth/register` | `app/auth/register/page.js` | No |
| `/buy` | `app/buy/page.js` | No |
| `/rent` | `app/rent/page.js` | No |
| `/sell` | `app/sell/page.js` | No |
| `/invest` | `app/invest/page.js` | No |
| `/property/[id]` | `app/property/[id]/page.js` | No |
| `/post-property` | `app/post-property/page.js` | **Yes** |
| `/projects` | `app/projects/page.js` | No |
| `/portal` | `app/portal/page.js` | **Yes** |
| `/account` | `app/account/page.js` | **Yes** |
| `/request-callback` | `app/request-callback/page.js` | No |
| `/help` | `app/help/page.js` | No |
| `/legal/*` | `app/legal/` | No |

---

## 11. Commands

```bash
npm run dev      # Dev server — Turbopack (port 3001 if 3000 taken)
npm run build    # Production build — only when explicitly asked
npm run lint     # ESLint check
npm install react-icons   # If react-icons is missing
```

---

## 12. Checklists

### Adding a new page
- [ ] File at `app/[route]/page.js`
- [ ] Default export matches intended page component name
- [ ] Content wrapped in `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- [ ] Uses `bg-navy-950` page background (inherited from body, but verify)
- [ ] Section spacing: `py-16 sm:py-20 lg:py-24`
- [ ] `"use client"` added only if the page itself needs state/effects
- [ ] Auth-protected pages: `<AuthGateModal>` pattern implemented

### Adding a new component
- [ ] File in correct `components/[category]/` folder
- [ ] `"use client"` only if browser APIs / state needed
- [ ] Only token color classes — no hex, no arbitrary `text-[#...]`
- [ ] Icons from `react-icons` — no raw SVGs
- [ ] Mobile-first: default → `sm:` → `lg:`
- [ ] Touch targets ≥ 44px on mobile
- [ ] Input fields use `inputClass` / `selectClass` / `textareaClass` from `inputStyles.js`

### Adding an icon
- [ ] Check react-icons.github.io for the icon
- [ ] Import from preferred set: `md`, `fi`, `bi`, or `fa6`
- [ ] Size with Tailwind: `className="h-5 w-5"` or `style={{ width: 20, height: 20 }}`
- [ ] Do NOT add to Navbar/Footer if those files still use their grandfathered SVGs

### Touching the auth system
- [ ] Never bypass `useAuth()` — it is the single source of truth
- [ ] Changes to the auth mechanism go in `AuthContext.jsx` only
- [ ] `login(token)` and `logout()` are the only mutation functions
- [ ] When the app moves to real auth, only `AuthContext.jsx` changes — rest of the app stays the same

---

## 13. Design Quality Standard

Every screen must feel **premium and intentional**. Minimum bar:

| Rule | Detail |
|---|---|
| Dark theme | Always `bg-navy-950` base, `bg-navy-900` cards |
| Gold accent | Gold on all CTAs, prices, active highlights (`text-gold-400`) |
| Serif for display | `font-display` on all headings, property prices |
| Tracked labels | `tracked-label` on all badges, nav items, eyebrow text |
| Hover feedback | Every interactive element has a `transition hover:` state |
| Border style | `border-navy-700/60` — never solid white or default gray borders |
| No Bootstrap colors | No plain red, blue, green — only the defined palette |
| Spacing | `py-16 sm:py-20 lg:py-24` between full sections |
