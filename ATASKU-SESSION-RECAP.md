# Atasku — Full Session Recap & New Session Context

> **Date:** 11 avril 2026
> **Repo:** https://github.com/elyamaniyous/atasku
> **Production:** https://promaint-cloud-production.up.railway.app
> **Domain:** atasku.com (owned, not yet connected)

---

## 1. What Is Atasku?

**Atasku** is a multi-tenant SaaS CMMS (Computerized Maintenance Management System) targeting energy and industrial SMEs (10-20 agents) in Francophone Africa (Morocco, Senegal, Ivory Coast, Cameroon) and France/Belgium.

**Business model:** B2C free tool (basic CMMS) + B2B monetized (Pro plan with AI + advanced features). Stripe billing with Free/Pro/Enterprise tiers.

**Origin:** Started as "ProMaint GMAO" (a standalone single-tenant CMMS), then evolved into "ProMaint Cloud" (multi-tenant SaaS), now rebranded as **Atasku**.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Runtime | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) | 4.x |
| Auth | Supabase Auth (password + magic link) | @supabase/ssr |
| Database | PostgreSQL (Supabase) | pgvector enabled |
| ORM | Supabase JS client (no Prisma) | @supabase/supabase-js |
| Billing | Stripe (subscriptions + webhooks) | stripe |
| AI | Google Gemini | @google/generative-ai |
| Charts | Recharts | 2.x |
| DnD | @dnd-kit (Kanban) | core + sortable |
| Tables | @tanstack/react-table | 8.x |
| PDF | @react-pdf/renderer | 4.x |
| Animations | Framer Motion | 11.x |
| Offline | IndexedDB sync queue + useOnlineStatus | custom |
| Deployment | Railway (Dockerfile) | node:20-alpine |

---

## 3. Monorepo Structure

```
atasku/
├── app/
│   ├── (auth)/                    # Login, signup, onboarding wizard
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── auth/callback/route.ts
│   │   └── onboarding/
│   │       ├── page.tsx           # Org creation
│   │       ├── equipment/page.tsx # Import equipment
│   │       ├── team/page.tsx      # Invite members
│   │       └── done/page.tsx      # Completion
│   ├── (dashboard)/               # Authenticated app (RLS-scoped)
│   │   ├── layout.tsx             # Shell: sidebar + header
│   │   ├── page.tsx               # Dashboard (KPIs, recent OTs, team)
│   │   ├── ordres/                # M1 - Work Orders
│   │   │   ├── page.tsx           # Kanban board
│   │   │   ├── liste/page.tsx     # Table view
│   │   │   └── [id]/page.tsx      # OT detail
│   │   ├── maintenance/           # M2 - Maintenance
│   │   │   ├── corrective/
│   │   │   ├── preventive/
│   │   │   └── historique/
│   │   ├── actifs/                # M3 - Equipment
│   │   │   ├── page.tsx           # Grid/list view
│   │   │   └── [id]/page.tsx      # Equipment detail
│   │   ├── planning/page.tsx      # M4 - Calendar (week/month)
│   │   ├── alertes/page.tsx       # M5 - Alert center
│   │   ├── rapports/page.tsx      # M6 - Reports & KPI
│   │   ├── ai/
│   │   │   ├── insights/page.tsx  # AI health insights
│   │   │   └── chat/page.tsx      # AI chat assistant
│   │   └── admin/
│   │       ├── team/page.tsx      # Member management
│   │       ├── billing/page.tsx   # Stripe billing
│   │       ├── settings/page.tsx  # Org settings
│   │       └── audit/page.tsx     # Audit log (Enterprise)
│   ├── (marketing)/               # Public pages
│   │   ├── home/page.tsx          # Landing page
│   │   └── pricing/page.tsx       # Pricing table
│   └── api/
│       ├── health/route.ts
│       ├── ai/chat/route.ts
│       ├── ai/insights/route.ts
│       ├── cron/alerts/route.ts
│       ├── cron/usage/route.ts
│       ├── webhooks/stripe/route.ts
│       └── pdf/[type]/route.ts
├── actions/                       # Server actions (13 files)
│   ├── ai.ts, alerts.ts, audit.ts, billing.ts, dashboard.ts,
│   ├── equipment.ts, invitation.ts, maintenance.ts, members.ts,
│   ├── org.ts, ot.ts, planning.ts, reports.ts
├── components/                    # 59 custom + 28 shadcn/ui
├── lib/
│   ├── supabase/ (client, server, middleware, admin)
│   ├── stripe/ (client, plans)
│   ├── ai/ (gemini, prompts)
│   ├── offline/ (sync-queue, use-online-status)
│   ├── pdf-templates/ (di, bt, rs, monthly-report, shared)
│   ├── types/database.ts
│   ├── auth-utils.ts
│   ├── constants.ts
│   └── utils.ts
├── supabase/migrations/           # 3 SQL migrations
├── Dockerfile
├── railway.toml
├── vercel.json
└── package.json
```

---

## 4. Database Schema (18 Tables)

| Table | Purpose | RLS |
|-------|---------|-----|
| organizations | Tenants (name, slug, plan, trial, Stripe IDs) | Yes |
| org_members | User ↔ Org membership with roles | Yes |
| invitations | Email invitations with token | Yes |
| usage_records | Usage tracking (users, equipment, storage, AI calls) | Yes |
| audit_logs | Action audit trail (Enterprise) | Yes (insert-only) |
| constructors | Equipment manufacturers | Yes |
| equipment | Assets with type, criticality, status, hours | Yes |
| spare_parts | Parts inventory per equipment | Yes |
| contracts | Maintenance/SLA/warranty contracts | Yes |
| work_orders | OTs with full lifecycle workflow | Yes |
| ot_status_history | Status change timeline per OT | Yes |
| interventions | Completed work details | Yes |
| part_usages | Parts consumed per intervention | Yes |
| attachments | File attachments | Yes |
| alerts | System alerts (panne, preventive, SLA, stock) | Yes |
| fuel_logs | Fuel consumption records | Yes |
| meter_readings | Equipment meter readings (hours, kWh) | Yes |
| ai_predictions | AI-generated predictions per equipment | Yes |
| ai_insights | Cached AI health insights | Yes |

**RBAC Roles:** OWNER, ADMIN, TECHNICIAN, SITE_MANAGER, READONLY

---

## 5. What Is DONE (Working in Production)

### Core CMMS (100% real Supabase data, zero mock)
- [x] **Auth:** Login (password + magic link), signup, session management
- [x] **Onboarding:** 4-step wizard (org → equipment → team → done) with 14-day Pro trial
- [x] **Dashboard:** KPI cards, recent OTs table, team workload, equipment status grid
- [x] **M1 Work Orders:** Kanban board (drag & drop), list view (sortable/filterable), detail page with tabs, status timeline, assignment, DI creation
- [x] **M2 Maintenance:** Corrective (stats + charts + table), Preventive (schedule + auto-generation), History (MTBF/MTTR calculations)
- [x] **M3 Equipment:** Grid/list view, filters (status, criticality, type, search), detail page with OTs/spare parts/meter readings
- [x] **M4 Planning:** Week/month calendar views, team availability/workload bars
- [x] **M5 Alerts:** Alert center with grouping, filtering, mark-read, notification dropdown with count badge
- [x] **M6 Reports:** KPI charts (recharts), period selector (7d/30d/90d/12m), performance/cost/equipment tabs
- [x] **Admin:** Team management (invite, role change, deactivate), billing (Stripe portal), org settings, audit log

### AI Features (Gemini)
- [x] **AI Insights:** Equipment health scoring, risk levels, anomaly detection, weekly summary
- [x] **AI Chat:** Maintenance assistant chatbot (French)
- [x] **Predictions:** Per-equipment failure prediction with meter readings analysis
- [x] **Root Cause Analysis:** Gemini analyzes past interventions for new issues

### PDF Generation
- [x] **DI** (Demande d'Intervention)
- [x] **BT** (Bon de Travail)
- [x] **RS** (Rapport de Service)
- [x] **Monthly Report**

### Billing (Stripe)
- [x] Webhook handler (checkout, subscription updates, cancellation, payment failure)
- [x] Plan enforcement (feature gating, usage limits)
- [x] Billing info page with portal link

### Marketing
- [x] Landing page (hero, features, modules, CTA)
- [x] Pricing page (3 tiers, FAQ)

### Infrastructure
- [x] Dockerfile (multi-stage, non-root, standalone output)
- [x] Railway deployment (health check, restart policy)
- [x] Vercel cron config (alerts every 2h, usage daily)
- [x] Offline support infrastructure (IndexedDB sync queue)

---

## 6. What Is MISSING / NOT WORKING

### Critical
| # | Issue | Impact |
|---|-------|--------|
| 1 | **Stripe keys are placeholders** (`sk_test_placeholder`) | Billing is non-functional. No real payments. |
| 2 | **Shared Supabase project** with NaviPact | Data isolation risk. Should be separate project. |
| 3 | **Some server actions lack explicit org_id filtering** | Rely solely on RLS. If service role client used accidentally, data leaks across tenants. |
| 4 | **Alert types mismatch** — cron creates types (`HOURS_250`, `PREVENTIVE_J1`) not in TypeScript types | Type safety gap. |

### Medium
| # | Issue | Impact |
|---|-------|--------|
| 5 | **"Nouvelle DI" button disabled** on Kanban/list pages | Users can only create OTs from corrective maintenance page. |
| 6 | **AI rate limits not enforced** | `aiCallsPerWeek` defined in plans.ts but never checked in AI actions. |
| 7 | **Storage usage TODO** | `billing.ts` returns `storage: { current: 0 }` — not calculated. |
| 8 | **Reports use hardcoded availability %** | Not calculated from actual uptime data. |
| 9 | **package.json still says "promaint-cloud"** | Should be "atasku". |
| 10 | **DB migration comments say "ProMaint Cloud"** | Branding inconsistency. |

### Low
| # | Issue | Impact |
|---|-------|--------|
| 11 | **Dead dependencies:** next-intl, next-themes, qrcode | Unused weight in bundle. |
| 12 | **No loading.tsx / error.tsx** for route segments | No route-level error boundaries. |
| 13 | **No not-found.tsx** at app root | 404 shows default Next.js page. |
| 14 | **.env.local.example incomplete** | Missing CRON_SECRET, STRIPE_PRO_PRICE_ID, GEMINI_API_KEY. |
| 15 | **Domain atasku.com not connected** to Railway. |

---

## 7. Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wyxmkeoyifuwrvnidyfl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe (NEED REAL KEYS)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# AI
GEMINI_API_KEY=AIzaSyC56f3RZRy18_xupEiVmMpQ1OH5kluSBPk

# App
NEXT_PUBLIC_APP_URL=https://atasku.com
CRON_SECRET=your-cron-secret
```

---

## 8. How to Start a New Session

```bash
cd /Users/youssef/atasku
pnpm dev    # Starts on port 3001

# Database (shared Supabase — migrations already applied)
# Login: create account via /signup or use existing Supabase users
```

### Key Files to Read First
1. `lib/types/database.ts` — All TypeScript types
2. `lib/constants.ts` — Navigation, page titles
3. `lib/stripe/plans.ts` — Plan definitions and limits
4. `lib/auth-utils.ts` — Auth helpers (getCurrentUser, hasPermission)
5. `actions/` — All server actions (13 files, 100% real Supabase)
6. `supabase/migrations/` — Full schema with RLS

### Architecture Patterns
- **Server Components** for all pages (data fetching at page level)
- **Server Actions** in `actions/` for all mutations
- **RLS** enforces multi-tenancy at DB level
- **Plan gating** via `hasPermission()` checks in pages
- **Gemini AI** with heuristic fallback when API fails

---

## 9. Recommended Next Steps (Priority Order)

1. **Connect atasku.com** to Railway (DNS + custom domain)
2. **Set up real Stripe** products/prices (replace placeholders)
3. **Separate Supabase project** for Atasku (avoid sharing with NaviPact)
4. **Fix critical bugs** (org_id filtering, alert type mismatch, enable DI button)
5. **Remove dead deps** (next-intl, next-themes, qrcode)
6. **Rename package** from promaint-cloud to atasku
7. **Add error boundaries** (loading.tsx, error.tsx, not-found.tsx)
8. **Enforce AI rate limits** per plan
9. **WhatsApp notifications** (killer feature for Africa market)
10. **Offline PWA** finalization (service worker registration)
