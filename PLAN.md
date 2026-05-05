# Plan — making invoice-app functional

State today: clickable demo. All `/app` data lives in `localStorage` via `DemoProvider`. No auth, no PDF, no email, no payments.

Goal: an actual user can sign in, save their business + clients, send a real PDF invoice over email, and (optionally) attach a Stripe payment link.

Ship in this order. Each step is independently usable.

---

## 1. Auth — Firebase Auth

**What:** Email-link + Google sign-in. Gate `/app/*`.

**Why:** Multi-tenant data needs a user id.

**Tasks:**
- `pnpm add firebase firebase-admin`
- `src/lib/firebase/client.ts` — `initializeApp` from public env
- `src/lib/firebase/admin.ts` — service account from server env (used by route handlers)
- `src/components/use-user.ts` — `onAuthStateChanged` hook
- `src/middleware.ts` — read session cookie, redirect unauthenticated `/app/*` → `/signin`
- `/signin` — wire email-link send + Google button. On callback, exchange ID token for a session cookie via a new `app/api/session/route.ts`
- `/app` `LogOut` link — call `signOut`, clear session cookie, redirect `/`

**Env (Vercel):** `NEXT_PUBLIC_FIREBASE_*` (6 keys), `FIREBASE_ADMIN_KEY` (JSON, single line)

**Done when:** typing an email at `/signin` lands you in `/app` after clicking the link in the inbox; refresh stays signed in; `/app` redirects to `/signin` in an incognito window.

---

## 2. Data — Firestore

**What:** Replace `DemoProvider` reads/writes with Firestore.

**Schema:**
```
users/{uid}
  business: { name, email, company, payment }
  createdAt: serverTimestamp

users/{uid}/clients/{clientId}
  name, email, lastAmount, createdAt

users/{uid}/invoices/{invoiceId}
  number: "INV-015"
  clientId, clientName, clientEmail (denormalized for the email)
  amount, currency, description
  status: "sent" | "paid"
  pdfUrl (set after step 3)
  paymentLinkUrl (set after step 5)
  sentAt, paidAt
```

**Tasks:**
- `src/lib/db.ts` — typed CRUD helpers (`getBusiness`, `listClients`, `addClient`, `listInvoices`, `addInvoice`)
- Server actions in `src/app/app/_actions.ts` for writes
- `firestore.rules` — `allow read, write: if request.auth.uid == userId`
- Replace `DemoProvider` usage with a server-fetched initial state + a thin client provider that re-reads after mutations
- Add `Add new client` form on `/app/new` step 0 (currently a placeholder button)
- Add edit fields on `/app/settings` (currently read-only)

**Done when:** sign in on a fresh browser → see your saved data; create a client + send invoice → it persists across logout/login.

---

## 3. PDF — @react-pdf/renderer

**What:** Generate a PDF on send.

**Tasks:**
- `pnpm add @react-pdf/renderer`
- `src/lib/pdf/invoice-pdf.tsx` — React-PDF document mirroring the preview screen
- `src/app/api/invoices/[id]/pdf/route.ts` — auth-gated, fetch invoice, render to buffer, return `application/pdf`
- On send, render once and upload to Firebase Storage at `users/{uid}/invoices/{id}.pdf`; store the download URL on the invoice doc
- Add a "View PDF" link on each ledger row

**Env:** `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

**Done when:** sending an invoice produces a downloadable PDF that matches the preview.

---

## 4. Email delivery — Resend

**What:** Email the PDF to the client.

**Tasks:**
- `pnpm add resend`
- `src/lib/email/send-invoice.ts` — wraps Resend SDK; from = the user's verified sending address
- Call from the send server action after the PDF is uploaded; attach the buffer (don't re-fetch the URL)
- Subject: `Invoice {number} from {business.name}`. Body: short plain text + the total + a "view PDF" link
- Mark invoice `sentAt` only after Resend returns 200

**Env:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (defaults to the user's business email once verified — for v1, hardcode a single sender domain you control)

**Setup:** see `~/.claude/projects/-Users-taypattison/memory/reference_resend_namecheap_setup.md` for the namecheap + resend domain wiring. App = `invoice-app`.

**Done when:** real inbox receives the PDF.

---

## 5. Stripe payment link (optional toggle)

**What:** On send, create a Stripe Payment Link and embed it in the email + the PDF.

**Tasks:**
- `pnpm add stripe`
- Per-user Stripe Connect onboarding flow at `/app/settings/payments` — Connect Express account, store `stripeAccountId` on the user doc
- On send, if user has a `stripeAccountId` and the invoice has `attachPaymentLink: true`, create a Payment Link via the API on behalf of the connected account, store `paymentLinkUrl` + `stripePaymentLinkId` on the invoice
- Webhook at `/app/api/stripe/webhook/route.ts` — listen for `checkout.session.completed`, mark matching invoice `status: "paid"`, set `paidAt`

**Env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`

**Done when:** clicking the link in the email pays the invoice → ledger status flips to `paid` within seconds of the webhook.

---

## 6. Hosting — Vercel

**Tasks:**
- `vercel link` then `vercel deploy`
- Add all env from steps 1–5 in Vercel project settings
- Point a domain (Namecheap → Vercel A/CNAME) when ready
- Add the deployed URL to Firebase Auth → Authorized domains

**Done when:** the live URL behaves identically to local.

---

## Open decisions (skip until they bite)

- Currency — currently `$`/`USD` hardcoded in the UI. Add a per-business default once a non-USD user shows up.
- Invoice numbering — currently `INV-NNN` from `nextInvoiceId(invoices)`. Move to a server-side counter on the user doc once two devices can race.
- Multi-line items, taxes, due-date config — explicitly out of scope ("no line items, no VAT setup" is the pitch).
- Reminders for unpaid invoices — out of scope for v1.
