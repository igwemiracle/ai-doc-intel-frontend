# AI Document Intelligence / Research Platform

A full-stack AI-powered document research platform, built as a deliberate **learning project** — the goal isn't just a working app, but a deep, from-first-principles understanding of every technology and architectural decision behind it. Progress is documented and shared publicly as it goes.

Every service in this stack runs on a **free tier**. That's treated as a hard design constraint throughout, not an afterthought.

---

## What this project does (end goal)

A platform where a user can upload documents, have them intelligently processed and embedded, and then **search, ask questions, and get AI-generated answers grounded in their own documents** (retrieval-augmented generation) — with authentication, background job processing, and object storage all working together as a real, production-shaped system, just built at a scale free tiers can support.

---

## Tech stack, and why each piece was chosen

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui** | App Router for modern React Server Components/Server Actions patterns; shadcn/ui for accessible, composable primitives rather than a locked-in component library |
| UI primitives | **Radix UI** (via shadcn preset `Nova`, Lucide icons, Geist font) | Chosen over the newer Base UI option specifically for its far deeper trail of documentation and community troubleshooting — prioritized for a learning context over "newest/recommended" |
| Database | **PostgreSQL via Neon** (serverless/hosted) | Free-tier friendly, real Postgres (not a toy DB), pooled + direct connection strings for runtime vs. migrations |
| ORM | **Prisma 6** (deliberately pinned, not 7) | Prisma 7 moved connection config into `prisma.config.ts` and requires explicit driver adapters — currently poorly documented for a learning context. Pinning to 6 preserves tutorial/community coverage and stability |
| Vector search | **pgvector** (Postgres extension) | Keeps embeddings in the same database as everything else rather than standing up a separate vector DB service |
| Auth | **Auth.js v5 (beta)** — Credentials (email/password, bcrypt) + GitHub OAuth, **JWT sessions** | Mature, well-documented ecosystem; supports both password and OAuth flows out of the box |
| AI | **OpenAI** — `gpt-4o-mini` (generation) + `text-embedding-3-small` (embeddings) | Cost-effective, well-documented models suited to a free-tier-constrained project |
| File storage | **Cloudflare R2** | S3-compatible object storage with a genuinely usable free tier |
| Background jobs | **BullMQ + Redis** | For async document processing (parsing, embedding generation) without blocking request/response cycles |

---

## Project structure

This project is split across **two parallel Claude chat threads within the same Project**, by concern:

- **Backend thread** — database schema, auth configuration, server actions, business logic
- **Frontend thread** — page/component styling and UX, built strictly on top of backend logic without modifying it

Working style in both: slow, deliberate pair-programming. Concepts are explained *before* code is drafted, no bundling multiple new ideas without checking in, and every non-trivial decision (library choice, error-handling pattern, file placement) is discussed rather than assumed.

---

## Roadmap — 10 phases

> Phase 1 is complete. Phases 2–10 below are the intended shape of the project based on the stack decisions already made; exact scope per phase may shift as the project progresses.

- [x] **Phase 1 — Foundation:** Next.js scaffold, PostgreSQL (Neon) + Prisma 6 schema (`User`, `Account`, `Session`), Auth.js v5 (Credentials + GitHub OAuth, JWT sessions), styled signup/login/dashboard pages with shadcn/ui
- [ ] **Phase 2 — Document upload & storage:** Cloudflare R2 integration, upload UI, file metadata in Postgres
- [ ] **Phase 3 — Document processing pipeline:** Text extraction/parsing, chunking strategy
- [ ] **Phase 4 — Embeddings & vector search:** `text-embedding-3-small` generation, pgvector storage and similarity search
- [ ] **Phase 5 — Background jobs:** BullMQ + Redis for async processing so uploads/embedding don't block requests
- [ ] **Phase 6 — AI chat / RAG:** `gpt-4o-mini`-powered Q&A grounded in embedded document content
- [ ] **Phase 7 — Chat UI:** Conversational interface, source/citation display back to originating documents
- [ ] **Phase 8 — Search & document management UX:** Browsing, organizing, and searching across uploaded documents
- [ ] **Phase 9 — Polish & hardening:** Error states, loading states, edge cases, rate limiting given free-tier constraints
- [ ] **Phase 10 — Deployment & write-up:** Production deployment on free-tier infrastructure, final public write-up of the build

---

## Current state (as of latest session)

### Backend — Phase 1 complete
- `User`, `Account`, `Session` Prisma models matching Auth.js's expected shape (`password String?` on `User`, optional to support OAuth-only users)
- Neon connection split: pooled `DATABASE_URL` for runtime queries, direct `DIRECT_URL` for migrations
- `lib/prisma.ts` — Prisma Client singleton (prevents connection exhaustion across Next.js hot-reload cycles)
- `auth.ts` — Auth.js config: Credentials provider (bcrypt password hashing, user-enumeration-safe `authorize`) + GitHub OAuth, JWT session strategy, `PrismaAdapter`
- Server Actions: `app/actions/signup.ts`, `app/actions/login.ts`, `app/actions/signout.ts`

### Frontend — auth UI complete
- `app/signup/page.tsx` + `components/signup-form.tsx` — shadcn `Card`/`Input`/`Label`/`Button`/`Alert`, inline error on duplicate email via `useActionState`
- `app/login/page.tsx` + `components/login-form.tsx` — same pattern, inline error on invalid credentials
- `app/dashboard/page.tsx` — protected server-rendered route (`auth()` session check + redirect guard), displays signed-in user email, sign-out button

### Known gaps / next up
- GitHub OAuth provider is configured in `auth.ts` but has no corresponding UI button yet
- No client-side schema validation yet (`zod` + shadcn's `Form` component deferred intentionally until basic flows were solid)
- Root `app/page.tsx` still shows default Next.js boilerplate — not yet a real landing page
- Phases 2–10 not started

---

## Key engineering decisions & lessons so far

- **Prisma 6 over 7:** stability and documentation depth over newest version, given the learning-first goal
- **Radix UI over Base UI:** same reasoning — deeper community troubleshooting trail for a learning context, even though Base UI is now shadcn's CLI default
- **Neon pooled vs. direct connections:** direct endpoint has cold-start behavior that can cause a `P1001` timeout on first migration; retrying resolves it
- **`throw` vs. `return {error}` in Server Actions:** throwing in an action wired to a form triggers Next.js's error-boundary behavior — the form unmounts and typed input is lost, which is wrong for *expected* failures like "email already registered." Refactored both `signup.ts` and `login.ts` to return a state object instead, consumed via React's `useActionState`, which preserves form state and provides a free `isPending` loading flag. True unexpected errors (and `redirect`/`signIn` internals) still throw and are handled separately.
- **`components/` vs. `app/`:** `app/` is routing-only (folders map to URL paths); shared, reusable UI lives in `components/` at the project root, resolved via the `@/` path alias in `tsconfig.json`
- **Env var naming matters exactly:** a `MissingSecret` error traced back to a leftover `BETTER_AUTH_SECRET` variable (from a library that was ultimately not used) instead of the `AUTH_SECRET` name Auth.js v5 actually expects

---

## Local setup (Frontend)

```bash
git clone <repo-url>
cd ai-doc-intel-frontend
npm install
```

Create a `.env.local` with:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 # URL of your separate backend service
AUTH_SECRET=                                 # generate via: npx auth secret
GITHUB_ID=
GITHUB_SECRET=
```

```bash
npm run dev
```

Visit `http://localhost:3000` to start exploring the application.