# Rizzly V2 🦖 — AI Dating Intelligence Platform

Welcome to **Rizzly V2**, a premium, high-fidelity AI-powered dating intelligence platform built with a retro neobrutalist cyberpunk visual aesthetic. Rizzly empowers users to optimize their online dating operations through multimodal profile audits, conversational prompt engineering, and deep psychological chat analysis.

This codebase is architected with modern industry best practices, featuring solid server-side security boundaries, database-authoritative state management, and resilient edge rate-limiting wrappers.

---

## 🏗️ System Architecture & Tech Stack

Rizzly is engineered on a modern, robust, and highly secure stack:

*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) for highly performant hybrid rendering, route grouping, and server-side route protections.
*   **Database & Authentication:** [Supabase](https://supabase.com/) (PostgreSQL + GoTrue Auth) providing secure authentication, structured schemas, Row-Level Security (RLS) data isolation, and transactional database procedures (`deduct_tokens`).
*   **State & Rate Limiting:** [Upstash Redis](https://upstash.com/) for low-latency, sliding-window API rate limiting (5 requests/60s) to protect costly AI endpoints from automated abuse and vector attacks.
*   **Artificial Intelligence:** [Google Gemini 2.5 Flash](https://aistudio.google.com/) multimodal AI engine leveraging native Structured Outputs (JSON Schemas) to guarantee strict response integrity.
*   **Payment & Subscriptions:** [Razorpay Subscriptions](https://razorpay.com/) integrated with robust server-side webhook endpoints to automatically synchronize plan upgrades (`pro` / `ultra_pro`) in real time.
*   **Analytics:** [PostHog](https://posthog.com/) for privacy-focused, premium client-side product metrics and click-tracking.
*   **Styling & Motion:** [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) for fluid transitions, glassmorphism filters, and a neobrutalist retro pixel-art appearance.

---

## 📂 Project Directory Structure

```filepath
rizzly/
├── public/                     # Static media assets and retro pixel indicators
├── src/
│   ├── app/                    # Next.js App Router Tree
│   │   ├── analyzer/           # Feature 1: Wingman Chat screenshot analyzer
│   │   ├── api/                # Authoritative server-side API endpoints
│   │   │   ├── analyze/        # POST: Chat wingman Gemini analyzer
│   │   │   ├── analyze-profile/# POST: Self profile audit Gemini optimizer
│   │   │   ├── analyze-target/ # POST: Target psychology decoding route
│   │   │   ├── create-order/   # POST: Razorpay transaction initialization
│   │   │   ├── generate-prompts/# POST: Conversational prompt generator route
│   │   │   ├── verify-payment/ # POST: Razorpay signature verification
│   │   │   └── webhooks/       # POST: Razorpay tier-sync webhooks
│   │   ├── auth/               # Supabase callback handlers & oauth helpers
│   │   ├── dashboard/          # Authenticated User Control Panel
│   │   │   ├── history/        # History page: Filter tabs, dynamic search & detailed modals
│   │   │   ├── profile-analyzer/# Feature 2: Self profile optimizer screen
│   │   │   ├── prompts/        # Feature 3: Smart onboarding questionnaire & prompt favorite list
│   │   │   ├── target-analyzer/# Feature 1: Target psychology analyzer upload screen
│   │   │   ├── layout.tsx      # Neobrutalist Desktop/Mobile global sidebar wrapper
│   │   │   └── page.tsx        # Dashboard Landing: dynamic stats sync'd to Supabase
│   │   ├── login/              # Secure auth login view
│   │   ├── pricing/            # Monetization card catalog
│   │   ├── signup/             # Secure user signup view
│   │   ├── globals.css         # Main Neobrutalist design tokens & shadows
│   │   ├── layout.tsx          # Root HTML frame & modern Google Font loading
│   │   └── providers.tsx       # Auth status & PostHog initialization wrapper
│   ├── components/             # Reusable UI component catalog
│   │   ├── ui/                 # Atomic neobrutalist items (buttons, inputs)
│   │   └── FreeTrialGate.tsx   # Glassmorphism trial expiration wall
│   ├── lib/                    # Shared system core services & libraries
│   │   ├── supabase/           # Isomorphic Supabase client creators (Server/Client context)
│   │   ├── history.ts          # Time formatting & legacy client utilities
│   │   ├── plan-utils.ts       # Database-backed tier validation & free use checks
│   │   ├── rate-limit.ts       # Upstash sliding-window Redis rate-limiter
│   │   ├── tokens.ts           # Client-side optimistic token balance helpers
│   │   └── utils.ts            # Dynamic CSS utility functions
│   └── middleware.ts           # Router-level auth guard protecting dashboard routes
├── .env.example                # Blueprint for local/production configuration
├── package.json                # Project dependencies & operational script runners
├── supabase_schema.sql         # SQL source-of-truth migrations & RLS policies
└── tsconfig.json               # Type-safe compiler configuration
```

---

## 🔒 Security Design & Boundaries

Rizzly enforces strict security boundaries to prevent malicious access and ensure key isolation:

### 1. Zero-Exposure Frontend
No sensitive operational keys (`GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, or `ANTHROPIC_API_KEY`) are ever exposed to the client-side bundle. Only safe, public identifiers prefixed with `NEXT_PUBLIC_` are delivered to the browser.

### 2. Double-Gated Token/Use Deduction
*   **Frontend (Optimistic UX):** Client checks local storage balances or database use flags to prevent user-facing lag and render warnings instantly.
*   **Backend (Authoritative Enforcement):** All expensive AI route calls verify active authentication states, validate remaining uses in Postgres, and deduct tokens server-side using secure Postgres transactional functions (`deduct_tokens`). Failed executions automatically trigger atomic transaction refunds.

### 3. Edge Rate Limiting
All generative endpoints are wrapped with an edge rate-limiting shield (`checkRateLimit()`) using **Upstash sliding-window Redis**. Rate limits are bound to the authenticated user ID (`user.id`) or fall back gracefully to client IP addresses to prevent automated cost depletion attacks.

---

## 💾 Database Schema & RLS Policies

The database is built on a PostgreSQL schema, featuring **Row-Level Security (RLS)** to guarantee absolute data isolation. Users can never read or write records belonging to other players.

### Core Tables:
*   `public.users`: Core customer model. Houses `plan_type` (`free`, `pro`, `ultra_pro`), `free_uses_remaining`, and token balances.
*   `public.analyses`: Primary operational history store. Holds raw multimodal payloads generated by Gemini for `chat_analysis`, `target_profile`, and `self_profile` formats.
    *   *RLS Check:* `auth.uid() = user_id` for select and insert.
*   `public.saved_prompts`: User prompts inventory. Stores favorited prompt cards in rich JSON strings.
    *   *RLS Check:* `auth.uid() = user_id` for all CRUD operations.

---

## 🛠️ Development & Deployment Instructions

### 1. Environment Configuration
Create a `.env.local` file at the root directory following the parameters outlined in `.env.example`:

```env
# Gemini AI Configuration
GEMINI_API_KEY=AIzaSy...

# Supabase Project Identifiers (Safe for public bundle)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Upstash Redis Connection (Server-side only)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token...

# Razorpay Subscriptions (Secret remains hidden)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=Tw7H...
```

### 2. Database Initialization
Execute the SQL commands inside [`supabase_schema.sql`](file:///Users/kunalsharma/Wingman/rizzly/supabase_schema.sql) in your Supabase SQL Editor. This will automatically:
1. Generate structural schemas for users, personas, transactional purchases, analyses, and saved prompts.
2. Enable RLS on all operational history and prompts tables.
3. Install secure procedural functions, including the concurrency-safe `deduct_tokens` function.

### 3. Running the Development Server
Install dependencies and launch the dev environment locally:

```bash
# Install npm packages
npm install

# Start Next.js turbopack server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view and test your changes.

### 4. Compiling a Production Build
Compile and verify typing integrity before deploying to production:

```bash
npm run build
```

This enforces strict TypeScript checks, creates optimized edge bundles, and structures static segments securely.

---

## 🛡️ Admin Panel

Rizzly includes a full-featured admin panel accessible at `/admin`. The admin panel uses a dark retro pixel-art theme and is completely isolated from the main user-facing app.

### Quick Setup

1. **Add env vars** to `.env.local`:
```env
ADMIN_EMAIL=admin@rizzly.com
ADMIN_PASSWORD=your_secure_password_here
ADMIN_JWT_SECRET=a_random_32_character_string_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
```

2. **Run the SQL migration** — execute `admin_schema.sql` in your Supabase SQL Editor to create the admin tables (`admin_config`, `prompt_versions`, `coupons`, `coupon_redemptions`, `feedback`).

3. **Access the panel** at `http://localhost:3000/admin` — log in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Admin Routes

| Route | Feature |
|---|---|
| `/admin/dashboard` | Overview stats: users, API calls, revenue, system health |
| `/admin/pricing` | Edit pricing plans (name, price, features, visibility) |
| `/admin/features` | Feature flags & toggles (maintenance mode, signups, API limits) |
| `/admin/prompts` | AI prompt editor with test button & version history |
| `/admin/users` | Paginated user table, search, plan override, CSV export |
| `/admin/analytics` | Charts: daily API calls, feature usage, plan distribution |
| `/admin/coupons` | Coupon code manager: create, bulk generate, pause, export |
| `/admin/announcements` | Sitewide announcement banner manager with live preview |
| `/admin/feedback` | User feedback inbox with read/star/resolve actions |
| `/admin/settings` | Integration health checks & environment info |

### Security
- Admin authentication is **separate from user auth** (JWT cookie, not Supabase Auth)
- All `/admin/*` routes are protected via middleware
- Admin API routes use the Supabase **service role key** to bypass RLS
- No admin credentials are exposed to the client bundle
