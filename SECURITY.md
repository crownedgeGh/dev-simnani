# Security Layers

Status of the 4-layer protection plan.

## 1. Edge Security & Bot Shield — Cloudflare WAF + Bot Fight Mode
**Not app code — Cloudflare dashboard config.** Do this once:
1. Add the domain to Cloudflare, point nameservers there (free plan is enough).
2. Dashboard → Security → Bots → turn on **Bot Fight Mode** (free) or **Super Bot Fight Mode** ($20 Pro).
3. Dashboard → Security → WAF → leave the managed ruleset on (default).
Covers DDoS, scrapers, zero-day attacks at the edge, before traffic reaches the app.

## 2. Form & Lead Protection — Cloudflare Turnstile ✅ implemented
Added to `/api/contact-inquiry` (ContactForm) and `/api/auth/send-otp` (OTP login/reset).
- `lib/turnstile.js` — server-side token verification.
- `components/shared/Turnstile.jsx` — client widget.
- Both routes 400 if the token fails verification; no-op (allows through) until keys are set, so nothing breaks today.

**To activate:** create a free Turnstile widget at the Cloudflare dashboard → Turnstile, then add:
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```
to `.env.local` / production env.

## 3. API & Login Rate Limiting
Already in place before this change: `lib/rateLimit.js`, an in-memory per-IP sliding-window limiter, applied to `send-otp`, `login`, `login-password`, `admin/login`, and property list routes. Now also applied to `contact-inquiry`.
- ponytail: in-memory means limits reset per server instance/restart and don't share state across multiple instances — swap for Upstash Redis + `@upstash/ratelimit` if you deploy more than one instance.

## 4. Domain & Phishing Guard — DMARC + SPF + DKIM
**Not app code — DNS records at your domain registrar/DNS host.** Add:
- **SPF** (TXT on root domain): `v=spf1 include:<your-email-provider> -all`
- **DKIM**: generate from your email provider (e.g. Google Workspace, SES) and add the TXT record they give you.
- **DMARC** (TXT on `_dmarc.<domain>`): `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@<domain>`
Exact values depend on whoever sends mail for `simnaniestate.com` (Workspace, SES, etc.) — need that provider's SPF/DKIM strings to fill in.
