import type { Tier } from "./types";

export type FeatureId =
  | "multi-currency"
  | "integrations"
  | "agent-api"
  | "stripe-payment-links"
  | "branded-invoice"
  | "auto-reminders"
  | "recurring-invoices"
  | "late-fee-policy"
  | "weekly-summary"
  | "auto-mark-paid"
  | "agent-approval";

export type FeatureMeta = {
  id: FeatureId;
  name: string;
  description: string;
  tier: Tier;
  built: boolean;
};

export const FEATURES: Record<FeatureId, FeatureMeta> = {
  "multi-currency": {
    id: "multi-currency",
    name: "Multi-currency",
    description: "Default currency in settings; override per invoice. Live FX.",
    tier: "pro",
    built: true,
  },
  integrations: {
    id: "integrations",
    name: "Client integrations",
    description: "Deliver invoices into QuickBooks, Xero, Slack instead of email.",
    tier: "pro",
    built: true,
  },
  "agent-api": {
    id: "agent-api",
    name: "Agent API",
    description: "Bearer-auth REST endpoints so an AI agent can send + follow up.",
    tier: "pro",
    built: true,
  },
  "stripe-payment-links": {
    id: "stripe-payment-links",
    name: "Stripe payment links",
    description: "Attach a one-tap pay link to every invoice; client pays from inbox.",
    tier: "pro",
    built: false,
  },
  "branded-invoice": {
    id: "branded-invoice",
    name: "Branded invoice",
    description: "Brand color on PDF today; logo upload coming soon.",
    tier: "pro",
    built: true,
  },
  "auto-reminders": {
    id: "auto-reminders",
    name: "Smart followups",
    description: "Polite, then firm, then final notice. Per-client cadence.",
    tier: "get-paid",
    built: false,
  },
  "recurring-invoices": {
    id: "recurring-invoices",
    name: "Recurring invoices",
    description: "Set a retainer once; it ships on the day you choose.",
    tier: "get-paid",
    built: false,
  },
  "late-fee-policy": {
    id: "late-fee-policy",
    name: "Late-fee policy",
    description: 'Set "5% if 14 days overdue" once; applied automatically.',
    tier: "get-paid",
    built: false,
  },
  "weekly-summary": {
    id: "weekly-summary",
    name: "Weekly summary email",
    description: "Outstanding total + overdue list, every Monday.",
    tier: "pro",
    built: false,
  },
  "auto-mark-paid": {
    id: "auto-mark-paid",
    name: "Auto-mark paid",
    description: "Stripe webhook flips status when payment lands.",
    tier: "pro",
    built: false,
  },
  "agent-approval": {
    id: "agent-approval",
    name: "Agent approval required",
    description: "Pause agent-drafted invoices for your review before sending.",
    tier: "pro",
    built: false,
  },
};

export const TIER_LABEL: Record<Tier, string> = {
  send: "Send",
  pro: "Pro",
  "get-paid": "Get Paid",
};
