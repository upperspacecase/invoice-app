# Nudge — Brand & Design System

> Source of truth for Nudge's look, voice, and mascot. The brand must be as strong
> inside the app as on the landing page — the old build's biggest miss was a warm
> landing that turned into a plain black-and-white app. One brand, end to end.

## The idea in one line

**Free to invoice. 1% to get paid.** A friendly, relentless little dog that chases
your invoices until the money's in.

## Strategy: the mascot *is* the product

Nudge's product behaviour is a persistent, friendly reminder that won't let your
invoice be ignored — polite, then firm, then final, until paid. That is also the
mascot's entire personality. Same playbook as the Duolingo owl (a character whose
whole job is relentless-but-lovable nudging), pointed at **getting paid** instead of
streaks. The name is literal: a dog nudges you with its nose.

---

## Mascot

A scrappy **Jack Russell terrier** in a green hi-vis vest who fetches your money and
trots it back with a **PAID** invoice in its mouth. Tenacious (won't drop it til it's
paid), warm, a bit cheeky — a tradie's dog on the job site.

- **Working name:** the dog is **Nudge** (default). Open alternatives if we want the
  dog named separately from the product: *Chase* (on-the-nose — the verb), *Scout*.
  Not locked.
- **Locked assets** (`brand/concepts/`):
  - `mascot-terrier-refined.jpeg` — hero, full body, trotting with PAID invoice
  - `mascot-icon.jpeg` — head-only, app icon / favicon
- **Poses still to make** (same style, same palette):
  - **Send** — trotting away, invoice in mouth (for the "sent" / sending state)
  - **Paid** — trotting back with cash/PAID (the celebration moment — design this
    one properly, it's the dopamine beat)
  - **Idle / sit** — alert, eager (empty states, onboarding)
  - **Overdue / alert** — ears up, focused (overdue invoices, urgency)
- **Style rules:** flat vector, thick even charcoal outlines, limited palette, bold
  simple shapes that read at 16px. Natural terrier coat (white + tan + black patches);
  the **green is on the vest and the brand, never the fur**. No gradients, no realism,
  no drop shadows beyond a single soft ground shadow.

---

## Colour

Retire the old cream / coral / pastel system entirely. New palette:

| Token (`globals.css`) | Old | New | Use |
|---|---|---|---|
| `--color-ink` | `#0a0a0a` | `#1C1F1A` | Warm near-black. Text, outlines. |
| `--color-paper` | `#ffffff` | `#FBFAF7` | Warm off-white page bg (NOT cream). |
| `--color-card` | `#ffffff` | `#FFFFFF` | Crisp white cards layer on warm paper. |
| `--color-paid` | `#2d7a4f` | `#2EB86A` | **Hero green.** CTAs, PAID, positive. |
| `--color-paid-deep` | — | `#1F8F50` | Green for text-on-light, hovers. |
| `--color-hivis` | — | `#DCF23C` | Energy accent only — vest, overdue, highlights. Sparingly. |
| `--color-mute` | rgba ink .55 | _keep_ | Secondary text. |
| `--color-rule` | rgba ink .10 | _keep_ | Hairlines, borders. |

**Retire and delete:** `--color-accent` (coral), `--color-coral*`, `--color-cream*`,
`--color-sun`, `--color-mint`, `--color-sky`, `--color-iris`, `--color-blush`.

Green is the brand. Hi-vis is a spice, not a base — if a screen looks like a safety
sign, there's too much yellow.

---

## Type

Drop **Fraunces** (the precious serif). Keep the two fonts already loaded; swap the
serif for a bold, friendly display face.

| Role | Font | Notes |
|---|---|---|
| Display / wordmark / headlines | **Bricolage Grotesque** (or Cabinet Grotesk) — `--font-display` | Bold, characterful, confident. Replaces Fraunces. |
| Body / UI | **DM Sans** — `--font-sans` | Keep. Friendly, clean. |
| Money & figures | **JetBrains Mono** — `--font-mono` | Keep. `$1,450` reads like a ledger in mono. Use for all amounts, invoice numbers, dates. |

---

## Shape & layout — utilitarian, get-shit-done

The forms are a **work order / spec sheet**, not a soft indie-SaaS app. The colour
palette is warm; the *shapes* are not.

- **Corners: square.** Radius 0 on cards, buttons, chips, inputs. No `rounded-2xl`,
  no `rounded-full` pills.
- **Rules, not shadows.** Structure comes from hard `1.5px` ink borders and dividers
  (think ruled fields on a form). No soft/blurry drop shadows. The one allowed shadow
  is a **hard offset block** — `4px 4px 0 var(--color-ink)` (or green) — on primary
  CTAs and the hero/pricing cards, for weight. Buttons "press" via
  `active:translate-x-[3px] active:translate-y-[3px]`.
- **Mono labels.** Every section eyebrow, field label, and meta line is
  `font-mono`, uppercase, `tracking-widest`, in `text-mute`. Data (amounts, ids,
  dates, the "DAY 07" log) is mono too.
- **Hi-vis is a highlighter.** Use `--color-hivis` like a marker on a worksheet —
  a status chip, a highlighted phrase — never as a fill for big areas.
- **No decoration.** No doodles, squiggles, blobs, sparkles, paper planes, hand-drawn
  underlines. Deleted from the landing; do not reintroduce. The dog mascot is the
  only illustration.
- **Layout: grid + dividers.** Sections read like a document — labelled rows,
  internal `1.5px` dividers, dense and aligned. The hero illustration is the invoice
  itself rendered as a ruled work order with a follow-up log.

---

## Voice

The mascot talks. Short, warm, tradie-mate, action-first. This is where "nail it and
get the money" lives. Never corporate, never "Dear valued customer."

| Moment | Copy |
|---|---|
| Empty state | "No invoices yet. Let's get you paid." |
| On send | "Sent it. I'll chase 'em." |
| Reminder fired | "Gave 'em a nudge. Sit tight." |
| Going overdue | "This one's dragging. Want me to get firm?" |
| Paid | "Paid! Good as gold." |
| Pricing | "Free to send. 1% when you get paid. That's it." |

Banned: filler ("simply", "just", "actually", "truly"), emojis, fake urgency
(no countdown timers on self-serve).

---

## Where the brand has to show up (not just the landing)

- App icon + favicon — `mascot-icon`
- The **send** animation (dog trots off) and the **paid** moment (dog trots back) —
  these two micro-moments carry the whole brand feeling
- Empty states, onboarding, loading
- **The chaser emails themselves** — the reminder comes "from" the dog. A stranger
  opens an email from a friendly dog chasing an invoice; that's the point.

---

## What this is paired with (model — see PLAN.md / MODEL)

- Free unlimited invoicing (the land-grab)
- **1% to get paid**, all-in: card → 1% on top of Stripe; bank transfer → routed via
  a **pay-by-bank button** (open banking) so it stays on-rail and the 1% is automatic,
  no separate bill. With a **cap** so high-volume tradies don't revolt.
- Built on the existing Stripe Connect rail (`application_fee_amount`, currently 0).
- Retired: the $12 Pro / $29 Get-Paid tiers, the subscription checkout, and the
  phantom-feature refund guarantee.
