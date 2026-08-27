<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Simnani Estate — Agent Rules

> **Read every section before writing a single line of code.**
> These rules apply to ALL AI agents (Antigravity, Claude, Cursor, Copilot, etc.) working in this repository.

---

## 1. Stack & Versions

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.2 |
| Runtime | React | 19.2.8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) | ^4 |
| Icons | **react-icons** | latest |
| Language | JavaScript (JSX) — no TypeScript | — |
| Package manager | npm | — |

### Critical Next.js 16 notes
- **Always read `node_modules/next/dist/docs/`** before using any Next.js API — v16 has breaking changes from training data.
- `app/` directory uses the **App Router** exclusively. Never create `pages/` files.
- Server Components are default. Add `"use client"` only when the component needs browser APIs, state, or event handlers.
- Images: use `next/image`. Remote images from `images.unsplash.com` are already whitelisted in `next.config.mjs`.
- Fonts: `next/font/google` — Playfair Display (`--font-playfair`) and Inter (`--font-sans`) are loaded in `app/layout.js`. Do not re-import fonts in components.

---

## 2. Design System — Use the Theme, Never Hardcode Colors

The design tokens are defined in `app/globals.css` under `@theme inline`. **Always use Tailwind theme classes instead of raw hex values.**

### Color palette

| Token | Class | Value | Use for |
|---|---|---|---|
| Background | `bg-navy-950` | `#05070c` | Page background, darkest surface |
| Surface | `bg-navy-900` | `#0a0e1a` | Cards, panels |
| Border | `border-navy-800` | `#111a2c` | Subtle dividers |
| Border active | `border-navy-700` | `#1b2740` | Default border |
| Border hover | `border-navy-600` | `#2a3a58` | Hover state |
| Text primary | `text-cream` | `#f5f1e8` | Body text, headings |
| Text muted | `text-muted` | `#9aa3b8` | Secondary text, labels |
| Gold highlight | `text-gold-400` | `#ffc633` | **Primary accent** — CTAs, headings, links |
| Gold light | `text-gold-300` | `#ffde85` | Hover state for gold |
| Gold base | `text-gold-500` | `#f5b400` | Active/pressed states |
| Gold dark | `text-gold-600` | `#d19700` | Rare dark accent |

> **Never write raw hex values** like `#ffc633` or `rgba(255,198,51,...)` in className. Use the token classes.
> When inline styles are absolutely required (animations, dynamic values), reference CSS variables: `var(--color-gold-400)`, `var(--color-navy-950)`, etc.

### Typography

| Purpose | Class | Font |
|---|---|---|
| Display/serif headings | `font-display` | Playfair Display (`--font-playfair`) |
| Body text, UI | `font-sans` | Inter (`--font-sans`) |
| Tracked uppercase label | `tracked-label` | Defined in globals.css: `letter-spacing: 0.16em; text-transform: uppercase` |

Use `tracked-label` for all small uppercase labels (nav links, badges, section eyebrows). **Do not recreate this class with ad-hoc utilities.**

---

## 3. Icons — Use react-icons, Not Custom SVGs

**Always use `react-icons`** for icons. Do not write custom `<svg>` elements for icons that exist in react-icons.

```jsx
// Correct
import { MdHome, MdAdd } from "react-icons/md";
import { FiUser, FiLock } from "react-icons/fi";

// Wrong — don't write raw SVG for standard icons
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>
```

**Preferred icon sets** (to keep bundle consistent):
- `react-icons/md` — Material Design (general UI)
- `react-icons/fi` — Feather Icons (clean, minimal)
- `react-icons/bi` — BoxIcons (property/real estate specific)
- `react-icons/fa6` — Font Awesome 6 (social, misc)

> **Exception:** The Navbar and Footer currently contain hand-drawn SVGs. Leave them as-is unless you are explicitly refactoring those files — don't mix approaches in the same file.

Install if not present: `npm install react-icons`

---

## 4. Responsiveness — Every UI Must Be Mobile-First

Every component and page **must work perfectly at all three breakpoints**:

| Breakpoint | Tailwind prefix | Min-width |
|---|---|---|
| Mobile (default) | _(none)_ | 0px |
| Tablet | `sm:` | 640px |
| Desktop | `lg:` | 1024px |

### Rules
- **Start mobile-first** — write the default (mobile) styles first, then progressively add `sm:` and `lg:` overrides.
- Max content width: `max-w-7xl` (most sections) or `max-w-[1400px]` / `max-w-[1500px]` for hero/navbar — match the existing pattern.
- Horizontal padding: `px-4 sm:px-6 lg:px-8` — always use this three-step pattern.
- Navbar collapses to hamburger below `lg:`. The mobile drawer is already implemented in `components/layout/Navbar.jsx`.
- Touch targets must be at least 44x44px on mobile.
- Grids: single column on mobile, 2-col on `sm:`, 3+ on `lg:`.

---

## 5. Component & File Conventions

### Directory structure
```
app/                    # Next.js App Router pages & layouts
  globals.css           # Tailwind v4 theme — single source of truth
  layout.js             # Root layout (fonts, AuthProvider, Navbar, Footer)
  page.js               # Homepage
  [route]/page.js       # Each route
components/
  auth/                 # Auth flow (login, register wizards, modals)
  home/                 # Homepage-specific sections
  layout/               # Navbar, Footer (shared)
  portal/               # User portal / dashboard
  project/              # Real estate project cards/pages
  property/             # Property cards, forms, uploads
context/
  AuthContext.jsx       # Global auth state — useAuth(), login(), logout()
lib/
  auth.js               # Auth helpers
  demoAccount.js        # Demo account data
  demoPortal.js         # Demo portal data
  locations.js          # Locations data
  projects.js           # Projects data
  properties.js         # Property data (PROPERTIES array, helpers)
  propertyContent.js    # Property detail content
public/                 # Static assets (useThis.png hero image, etc.)
```

### Naming conventions
- Pages: `app/[route]/page.js` — lowercase kebab-case route.
- Components: PascalCase filename, default export matches filename exactly.
- Data/helper files in `lib/`: camelCase.
- No TypeScript. Pure `.js` / `.jsx` only.

### "use client" directive
- Add `"use client"` only when needed: `useState`, `useEffect`, `useContext`, event handlers, browser APIs.
- `AuthProvider`, `AuthGateModal`, `Navbar`, all form components — always `"use client"`.
- Static sections (Hero, Footer, PropertyCard if data is passed as props) — can remain Server Components.

---

## 6. Auth System

The project uses a custom client-side auth system (no NextAuth/Clerk/etc.).

### Key files
| File | Purpose |
|---|---|
| `context/AuthContext.jsx` | `AuthProvider`, `useAuth()` hook — wraps entire app in `layout.js` |
| `lib/auth.js` | Auth helpers |
| `components/auth/AuthCard.jsx` | Mobile OTP login card |
| `components/auth/AuthGateModal.jsx` | Modal shown when unauthenticated user hits a protected action |
| `components/auth/AccountTypeSelect.jsx` | Registration step 1 — choose account type |
| `components/auth/BuyerRegistrationWizard.jsx` | Multi-step buyer registration |
| `components/auth/BrokerRegistrationWizard.jsx` | Multi-step broker registration |
| `components/auth/InvestorRegistrationWizard.jsx` | Multi-step investor registration |
| `components/auth/FreelancerRegistrationWizard.jsx` | Multi-step freelancer registration |

### How to use auth
```jsx
"use client";
import { useAuth } from "@/context/AuthContext";

const { isAuthenticated, isLoading, login, logout } = useAuth();
```

- `useAuth()` throws if called outside `<AuthProvider>`.
- Current auth is demo/localStorage-based (`se_auth_token`).
- Protected routes/actions: check `isAuthenticated` and show `<AuthGateModal>` if false.

### AuthGateModal pattern
```jsx
const [showAuthGate, setShowAuthGate] = useState(false);

function handleProtectedAction() {
  if (isAuthenticated) {
    // proceed
  } else {
    setShowAuthGate(true);
  }
}

// In JSX:
<AuthGateModal isOpen={showAuthGate} onClose={() => setShowAuthGate(false)} />
```

---

## 7. Shared Input Styles

Use the shared input style constants from `components/auth/inputStyles.js`:

```js
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
```

These enforce consistent `h-14`, `border-navy-700/60`, `bg-navy-950`, `focus:border-gold-400` styling across all forms.

---

## 8. Property Data & Pages

- All property data lives in `lib/properties.js` — `PROPERTIES` array, `getPropertiesByType(type)`, `getFeaturedProperties()`, `getPropertyById(id)`.
- Property types: `"buy"`, `"sell"`, `"rent"`, `"invest"`.
- Property pages live at `/property/[id]`.
- Images: Unsplash URLs (already whitelisted). Format: `?w=1200&q=80&auto=format&fit=crop`.
- Property IDs format: `SG-PROP-XXXXXX` (6 random digits). Generate client-side inside `useEffect` to avoid SSR hydration mismatch.

---

## 9. Common Pitfalls & Anti-Patterns

### Hydration mismatches
- Do NOT use `Math.random()`, `Date.now()`, or `new Date()` directly in render — causes server/client mismatch.
- Property ID generation must happen inside `useEffect` or use React's `useId()`.
- `new Date().getFullYear()` is fine only in Server Components (like Footer).

### Inline styles
- Avoid inline styles for static values. Use Tailwind classes.
- Inline styles acceptable only for: dynamic values, animation keyframes in `<style>`, `backdropFilter`.
- When you must use inline style with a color, use CSS variables: `var(--color-gold-400)` instead of `#ffc633`.

### SVG icons
- Use `react-icons`. Existing hand-rolled SVGs in Navbar/Footer/PropertyCard are grandfathered — do not add new ones.

### max-w patterns
- Navbar/Hero: `max-w-[1500px]` / `max-w-[1400px]` with `mx-auto`.
- Most content sections: `max-w-7xl mx-auto`.
- Auth cards: `max-w-md`.
- Always apply horizontal padding: `px-4 sm:px-6 lg:px-8`.

---

## 10. Routes Map

| URL | File | Notes |
|---|---|---|
| `/` | `app/page.js` | Homepage |
| `/auth` | `app/auth/page.js` | Login (OTP) |
| `/auth/register` | `app/auth/register/page.js` | Registration wizard |
| `/buy` | `app/buy/page.js` | Buy listings |
| `/rent` | `app/rent/page.js` | Rent listings |
| `/sell` | `app/sell/page.js` | Sell listings |
| `/invest` | `app/invest/page.js` | Investment listings |
| `/property/[id]` | `app/property/[id]/page.js` | Property detail |
| `/post-property` | `app/post-property/page.js` | Post property form (auth protected) |
| `/projects` | `app/projects/page.js` | Projects/developments |
| `/portal` | `app/portal/page.js` | User portal/dashboard |
| `/account` | `app/account/page.js` | Account settings |
| `/request-callback` | `app/request-callback/page.js` | Callback request form |
| `/help` | `app/help/page.js` | Help center |
| `/legal/*` | `app/legal/` | Privacy, T&C, etc. |

---

## 11. Commands

```bash
npm run dev      # Start dev server (Turbopack, port 3001 if 3000 taken)
npm run build    # Production build (only if asked)
npm run lint     # ESLint
```

---

## 12. Design Quality Bar

Every UI must be **premium and visually excellent**:
- Dark theme always: `bg-navy-950` page background, `bg-navy-900` for cards.
- Gold accents (`text-gold-400`, `border-gold-500/70`) on interactive elements, highlights, headings.
- `font-display` (Playfair Display) for headings/prices; `font-sans` (Inter) for body.
- `tracked-label` for all uppercase small labels.
- Hover transitions: `transition hover:bg-gold-500/10`, `hover:text-gold-400`, etc.
- Subtle borders: `border-navy-700/60` — never solid white borders.
- Section spacing: `py-16 sm:py-20 lg:py-24` for full sections.
- No plain Bootstrap-style blue/red/green — only the defined palette.
- Mobile drawer and desktop header are both fully implemented. Do not break them.
