import "server-only";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/client";
import {
  listInvoices,
  logActivity,
  markInvoicePaid,
  setTier,
  updateBusiness,
} from "@/lib/server/store";
import type { Tier } from "@/lib/types";

export const runtime = "nodejs";

async function findUidByCustomer(customerId: string): Promise<string | null> {
  const snap = await adminDb()
    .collectionGroup("meta")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const parent = snap.docs[0].ref.parent.parent;
  return parent ? parent.id : null;
}

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
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid =
          (session.client_reference_id as string | null) ||
          (session.metadata?.uid as string | undefined) ||
          null;
        const tier = session.metadata?.tier as Tier | undefined;
        if (session.mode === "subscription" && uid && tier) {
          await updateBusiness(uid, {
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id,
          });
          await setTier(uid, tier);
          await logActivity(
            uid,
            "system",
            `Subscription started: ${tier}`,
            session.id
          );
        } else if (session.mode === "payment" && session.payment_link) {
          const paymentLinkId =
            typeof session.payment_link === "string"
              ? session.payment_link
              : session.payment_link.id;
          const match = await findInvoiceByPaymentLink(paymentLinkId);
          if (match) {
            await markInvoicePaid(match.uid, match.invoiceId, "system");
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const uid = await findUidByCustomer(customerId);
        if (uid) {
          await setTier(uid, "send");
          await updateBusiness(uid, { stripeSubscriptionId: undefined });
          await logActivity(uid, "system", "Subscription canceled", sub.id);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const uid = await findUidByCustomer(customerId);
        if (!uid) break;
        const tier = (sub.metadata?.tier as Tier | undefined) ?? null;
        if (tier && sub.status === "active") {
          await setTier(uid, tier);
        } else if (sub.status === "canceled" || sub.status === "incomplete_expired") {
          await setTier(uid, "send");
        }
        await logActivity(
          uid,
          "system",
          `Subscription ${sub.status}`,
          sub.id
        );
        break;
      }
      default:
        // ignore other event types
        break;
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "webhook handler failed" },
      { status: 500 }
    );
  }
}

// listInvoices is imported to keep tree-shaking from dropping the module
// reference — webhook handlers occasionally need to enumerate user invoices.
void listInvoices;
