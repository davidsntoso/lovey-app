# Couple Virtual Gift Website — Prototype Design

Date: 2026-07-15

## Origin

Inspired by TikTok account `@kadovirtual.co` ("kado virtual" = Indonesian for
"virtual gift"). Niche: sell personalized micro-websites as digital gifts —
romance/celebration content for couples, delivered via link or QR code
instead of a physical gift.

## Business concept

Template-based virtual gift websites for couples. Multiple scenario themes
(Valentine's Day, birthday, monthsary/anniversary, wedding, etc.), each
customized per client and deployed to a free custom domain/subdomain. Buyer
sends the recipient a link or QR code to "open" their gift.

## V1 roadmap

1. **Prototype** (this spec) — one static template, Valentine's scenario.
   Proves the format end-to-end: config → animated site → live link → QR.
2. **Template library** — replicate the pattern for birthday / monthsary /
   wedding scenarios. Shared component base + per-scenario theme (colors,
   copy defaults, animation flavor).
3. **Generator pipeline** — replace "hand-edit a config file" with a real
   intake step (form or sheet-based input) that produces the config and
   triggers deploy. No manual coding per order.
4. **Deploy automation** — per-client subdomain (e.g.
   `namafor.lovekado.site`) via wildcard DNS on a host like Cloudflare
   Pages/Vercel, auto-provisioned per order.
5. **Storefront + delivery** — checkout (e.g. TikTok Shop) → auto-generate
   site → send buyer the link + QR.
6. **Monetization tiers** — base template vs. "deluxe" (more photos, longer
   timeline, premium music, no watermark, custom subdomain word).

Steps 2–6 are out of scope here and will get their own specs later. This
spec covers step 1 only.

## Prototype scope

**Scenario:** Valentine's Day gift site. Single demo couple (placeholder
names/photos/song) — proves the template, not a specific real order.

**Stack:** Plain HTML/CSS/JS. No build step, no framework. Matches the
eventual "per-client static site" delivery model.

**Content input:** A single config file (`content.js`) holds all
client-specific data — names, message text, wishes list, timeline entries
(date, photo, caption), song file URL, theme accent color. Swapping this
file is how a future generator would inject per-client data; for the
prototype it's hand-edited.

**User flow:**
1. Cover screen — "A gift for [Name] 💌" + tap-to-open envelope button.
   Tap is required to unlock audio autoplay (browser policy).
2. On open: envelope/gift-box opening animation (CSS transform + a
   confetti/hearts burst), song starts playing, scene transitions into
   content.
3. Scrollable sections: Special Words (personal message), Wishes,
   Journey/Moments (photo timeline with dates + captions), closing
   reveal (final message + looping hearts/petals animation).
4. Ambient floating hearts/particles animate in the background throughout.

**Delivery mechanism:** Deploy to GitHub Pages (gh CLI already
authenticated, no new login) → live URL → QR code image generated from that
URL via a QR image API (`<img>` tag, no client-side QR library needed).
Link + QR are the "send to recipient" artifacts.

**Explicitly out of scope:** admin/intake form, payment, multi-tenant
automation, wildcard custom domain, account system, other scenario themes,
analytics.

## Open risks / notes for later steps

- Browser autoplay-with-sound restrictions mean every scenario template
  needs the tap-to-open gate — not just Valentine's.
- GitHub Pages is fine for a public demo but doesn't support true
  per-client custom subdomains at scale (step 4 needs a different host).
- Config-file-per-client doesn't scale past a handful of manual orders —
  step 3 (generator pipeline) is the real unlock for volume.
