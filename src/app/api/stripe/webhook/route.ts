import "server-only";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/client";
import { markInvoicePaid } from "@/lib/server/store";

export const runtime = "nodejs";

async function findInvoiceByPaymentLink(
  paymentLinkId: string
): Promise<{ uid: string; invoiceId: string } | null> {
  const snap = await adminDb()
    .collectionGroup("invoices")
    .where("stripePaymentLinkId", "==", paymentLinkId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const parent = doc.ref.parent.parent;
  if (!parent) return null;
  return { uid: parent.id, invoiceId: doc.id };
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return Response.json(
      { error: "Stripe webhook not configured." },
      { status: 503 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Bad signature" },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      // The only checkout we run is a one-tap invoice payment via a Payment
      // Link. When it completes, mark the matching invoice paid.
      if (session.mode === "payment" && session.payment_link) {
        const paymentLinkId =
          typeof session.payment_link === "string"
            ? session.payment_link
            : session.payment_link.id;
        const match = await findInvoiceByPaymentLink(paymentLinkId);
        if (match) {
          await markInvoicePaid(match.uid, match.invoiceId, "system");
        }
      }
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "webhook handler failed" },
      { status: 500 }
    );
  }
}
