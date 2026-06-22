# Kovvuri Nandi Vardhan Reddy — Portfolio

Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion + GSAP + Lenis. Visual language
(monochrome, `text-shiny` headlines, glass-card panels, kinetic-typography hero, numbered project
list, parallax certificate marquee) is adapted from a friend's template; all code, content, and
backend integrations are original.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

ESLint runs during `npm run build` (no longer suppressed) and passes clean against
`next/core-web-vitals`.

## Environment variables

Copy `.env.local.example` to `.env.local` (already done for you) and fill in real values:

```bash
GITHUB_TOKEN=             # optional — raises GitHub stats rate limit 60/hr → 5,000/hr
CODING_STATS_API_URL=     # optional — defaults to https://python-pfww.onrender.com
NIM_API_URL=              # optional — same default backend, chatbot endpoint
CONTACT_API_URL=          # optional — same default backend, contact-form endpoint
NEXT_PUBLIC_SITE_URL=     # set once deployed — used for sitemap/robots/OG tags
```

⚠️ The GitHub token you pasted in chat earlier should be revoked and replaced —
https://github.com/settings/tokens. It isn't in this codebase, but treat anything pasted into a
chat as compromised.

## Architecture

- **`src/data/portfolio.ts`** — single source of truth for all content (personal info, projects,
  achievements, tech stack, stats). Edit this file to update anything on the site.
- **`src/app/page.tsx`** is a **server component** — all sections render unconditionally in the
  initial HTML (verified via curl: every section's `id` is present in the raw SSR response). Only
  `HeroIntro` (the loading-screen + Hero-entrance choreography) is client-side; everything else
  gets real SSR for SEO and faster initial paint.
- **Fonts** use `next/font/local` pointed at the `@fontsource` package files already in
  `node_modules` (`src/lib/fonts.ts`) — self-hosted (no Google Fonts network call at build time)
  *and* gets `next/font`'s automatic `font-display: swap` + preloading, fixing the FOIT the plain
  CSS `@import` approach had.

## The three backend integrations

All three point at `https://python-pfww.onrender.com` by default (override via the env vars
above if it ever moves):

| Route | Real endpoint | What it does |
|---|---|---|
| `/api/coding-stats` | `GET /api/stats` | LeetCode/CodeChef/HackerRank/GFG stats, with shape-based normalization in case any platform's data lands under the wrong key |
| `/api/nim` | `POST /api/nim` | Chatbot — streams SSE, no auth header (backend holds its own NIM key), prepends a system prompt auto-built from `portfolio.ts` |
| `/api/github-stats` | GitHub's own API | Falls back to public REST if `GITHUB_TOKEN` isn't set |
| `/api/contact` | `POST /api/contact` | Proxies the real backend (AI auto-reply via NIM → Brevo email → notification email), relaying its `200`/`207`/`400` response shape as-is |

None of these were end-to-end testable against the live backend from the sandbox this was built
in (`python-pfww.onrender.com` isn't on its network allowlist). I built local mock servers
replicating each documented contract exactly and tested the full chain (route → proxy →
client parsing) against those — confirmed correct, but worth a real smoke test once deployed.

## Chatbot

- **Streaming** — `/api/nim` proxies the backend's SSE stream through unmodified; the client reads
  it token-by-token.
- **Typewriter reveal** — raw chunks land in a ref and a steady ~24ms ticker reveals characters
  from it, decoupled from how bursty the actual network chunks are. This is the fix for "typing
  animation" — without it, a burst of tokens after a cold-start delay would just pop in all at
  once instead of looking like typing.
- **Persistence** — chat state now lives in the top-level `ChatBot` component, not the
  `ChatWindow` that mounts/unmounts on open/close (that was the actual bug — every close was
  discarding the hook's state because the component holding it was unmounting). It's also
  persisted to `sessionStorage`, so it survives page reloads/navigation within the tab too, and
  there's a small "clear history" button in the chat header.
- **Markdown rendering** — replies render real `**bold**`, numbered lists, and bullet lists now
  instead of dumping literal asterisks/digits as plain text.
- **Grounded system prompt** — auto-built from `portfolio.ts` (`src/lib/chatbotContext.ts`) so the
  model answers from real facts about your projects/skills instead of guessing, and can't drift
  out of sync with the live site.
- **Error isolation** — wrapped in an `ErrorBoundary` in `layout.tsx`; a chatbot crash can't take
  the rest of the page down with it.

## The auto-scroll bug, root cause

The actual bug: `scrollIntoView({ behavior: 'smooth' })` was called on every single streamed
chunk — sometimes dozens of times a second. Each call cancels whatever smooth-scroll animation
was already in progress, so the view never actually finished moving and just looked stuck. Fixed
by tracking whether the user is pinned to the bottom (within ~80px) and, when they are,
scrolling there *instantly* (`el.scrollTop = el.scrollHeight`, no animation to fight itself) on
every update. Smooth scrolling is now reserved for discrete actions — sending a message, tapping
the "jump to latest" button — where there's only one call, so nothing competes with it. If the
user has scrolled up to read history, streaming replies no longer yank them back down.

## The navbar "links default to hero" bug, root cause

Section anchors (`#about`, `#stack`, etc.) only existed in the DOM once the homepage's
`isLoading` state flipped to `false` client-side — before that, those sections weren't rendered
at all. A nav click's hash-scroll could fire before that happened, find nothing, and land
wherever it already was (the hero). Fixed two ways: (1) `page.tsx` is now a server component
that always renders every section, so the anchors exist immediately in the initial HTML, and
(2) the navbar's section links now handle their own scrolling explicitly (`getElementById` +
`scrollIntoView`) instead of relying on the browser/Next.js's automatic hash handling, including a
retry loop for the cross-page case (e.g. clicking "About" from `/projects`).

## Contact

- **`/contact`** — dedicated page (now with real metadata, via a thin server-component wrapper
  around the client form) with Name/Email/Subject/Message, posting to `/api/contact`. Subject is
  optional, defaulting server-side to "Contact Form Submission" per the backend's contract.
  Displays email, phone, and social links directly.
- Handles all three documented response shapes: `200` success, `207` partial (shows the specific
  warnings, e.g. if the auto-reply email failed but the notification didn't), `400` validation.
- The homepage's Contact section is a shorter CTA pointing to `/contact` plus a social ticker and
  FAQ accordion, rather than a duplicate form.

## Cloudflare R2 assets — DNS issue from your local run

Your `npm run dev` log showed `getaddrinfo ENOTFOUND pub-1bba152a6fe4451b8d45d1e11980038c.r2.dev`
— that's a **DNS resolution failure**, not a 403/404. The hostname isn't resolving at all, which
points at the R2 bucket's public access not being fully enabled (or the dev-subdomain hostname not
matching what's actually configured) rather than anything in this codebase. Check in the
Cloudflare dashboard: **R2 → your bucket → Settings → Public Access → R2.dev subdomain** is
"Allowed", and that the exact hostname shown there matches what's in `src/data/portfolio.ts`'s
`CDN_BASE`. I can't verify this myself since that domain isn't reachable from the sandbox this was
built in either — `next.config.js`'s `remotePatterns` entry for it is confirmed correct (tested
against the real `/_next/image` optimizer route), so once the bucket itself resolves, images
should start working immediately with no code changes needed.

## `/api/nim` request durations from your log

The `POST /api/nim 200 in 65989ms` entry is expected, not a bug — that's Render's free-tier cold
start (the backend sleeps after inactivity) plus actual generation time for a streamed response.
The route's 45-second timeout only covers time-to-first-byte (the `fetch()` call resolving once
headers arrive); for a streaming response the timeout is correctly *not* applied to the full
duration of reading the SSE body afterward, since that's expected to take as long as the model
takes to generate.

## Coding Statistics

- Removed the "All platforms sync from one self-hosted aggregator..." disclaimer line per request.
- GitHub contribution calendar now follows the site's actual resolved theme (`next-themes`)
  instead of being hardcoded to dark.
- Added an aggregate "Problems Solved Across Platforms" stat and brand-tinted cards.

## Code quality

- **ESLint re-enabled** during builds (`next/core-web-vitals`) — passes clean, no more
  `ignoreDuringBuilds: true` suppression.
- **Removed `any` types** throughout the API routes and components — `useApi<T>` is properly
  generic now, icon maps are `Record<string, LucideIcon>`, catch blocks use `unknown` with
  `instanceof Error` narrowing, and the coding-stats normalizer uses `unknown` + property checks
  instead of `any`.
- **Deleted stale orphan directories** (`src/{app,components...` and similar literal-brace-name
  folders) left over from an early scaffolding command whose brace expansion didn't fully execute.
- `not-found.tsx` *is* correctly wired to the `QuantumError` component — its small file size
  (141 bytes) is expected for a one-line wrapper, not a sign it's disconnected.

## Accessibility & SEO

- `prefers-reduced-motion: reduce` now disables/shortens CSS transitions and animations globally.
  (Framer Motion's own spring/tween animations — the GSAP hero icons, page-section reveals — aren't
  covered by this CSS-only rule and would need `useReducedMotion()` wired into each animated
  component individually; that's a larger follow-up, not done here.)
- Visible `:focus-visible` ring on all interactive elements; bumped `--muted-foreground` lightness
  in light mode (45% → 38%) to clear WCAG AA contrast against white.
- Dynamic favicon (`app/icon.tsx`) and Open Graph image (`app/opengraph-image.tsx`) generated via
  `next/og` — no binary image assets needed.
- Open Graph + Twitter Card meta tags, JSON-LD `Person` structured data, `robots.txt` and
  `sitemap.xml` (both via Next's built-in file conventions), per-page meta descriptions on
  `/projects`, `/achievements`, `/contact`, and each project detail page.
- Added `sizes` props and more descriptive `alt` text to every `next/image` using `fill` that was
  missing them.

## Consciously deferred

A lot of additional review feedback came in alongside the numbered requests. Addressed what was
concrete and scoped; deferring these since they're either large redesigns or conflict with
explicit earlier direction:

- **Monochrome color palette** — flagged as "too monochrome, add one accent color." This was a
  deliberate, explicit instruction several rounds ago ("strictly adhere to the original project's
  visual identity"), which *is* monochrome by design. Happy to add an accent color if you actually
  want that now, but didn't want to unilaterally undo an earlier explicit decision.
- **Per-section heading variety**, **light-mode-specific redesign**, **removing GSAP/react-icons to
  shrink bundle size**, **mobile-specific hero icon/ProfileCard treatments** — all reasonable, all
  sizable enough to warrant their own pass rather than being squeezed in here.
- **Full `prefers-reduced-motion` coverage for Framer Motion** — see Accessibility section above.

## Known residual `npm audit` findings

5 vulnerabilities (1 moderate, 4 high), all inside Next.js 14.2.x's own dependency tree (image
optimization DoS, SSRF via WebSocket upgrades, RSC cache poisoning, middleware bypass) or its
bundled `postcss`. `npm audit fix --force` resolves them by jumping to Next 16, which is a breaking
major-version change (likely also wants React 19) — didn't want to bundle a risky framework
upgrade into this already-large change set without it being its own dedicated, separately-tested
pass. Worth doing soon as its own task.

## Deploying

Works out of the box on Vercel: push to GitHub, import on vercel.com/new, set the env vars above,
deploy.
