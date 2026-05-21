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
  built: boolean;
};

export const FEATURES: Record<FeatureId, FeatureMeta> = {
  "multi-currency": {
    id: "multi-currency",
    name: "Multi-currency",
    description: "Default currency in settings; override per invoice. Live FX.",
    built: true,
  },
  integrations: {
    id: "integrations",
    name: "Client integrations",
    description: "Deliver invoices into QuickBooks, Xero, Slack instead of email.",
    built: true,
  },
  "agent-api": {
    id: "agent-api",
    name: "Agent API",
    description: "Bearer-auth REST endpoints so an AI agent can send + follow up.",
    built: true,
  },
  "stripe-payment-links": {
    id: "stripe-payment-links",
    name: "Stripe payment links",
    description: "Attach a one-tap pay link to every invoice; client pays from inbox.",
    built: true,
  },
  "branded-invoice": {
    id: "branded-invoice",
    name: "Branded invoice",
    description: "Brand color on PDF today; logo upload coming soon.",
    built: true,
  },
  "auto-reminders": {
    id: "auto-reminders",
    name: "Smart follow-ups",
    description:
      "An AI assistant sends warm, gentle nudges on unpaid invoices — spaced over three weeks, never pushy.",
    built: true,
  },
  "recurring-invoices": {
    id: "recurring-invoices",
    name: "Recurring invoices",
    description: "Set a retainer once; it ships on the day you choose.",
    built: false,
  },
  "late-fee-policy": {
    id: "late-fee-policy",
    name: "Late-fee policy",
    description: 'Set "5% if 14 days overdue" once; applied automatically.',
    built: false,
  },
  "weekly-summary": {
    id: "weekly-summary",
    name: "Weekly summary email",
    description: "Outstanding total + overdue list, every Monday.",
    built: false,
  },
  "auto-mark-paid": {
    id: "auto-mark-paid",
    name: "Auto-mark paid",
    description: "Stripe webhook flips status when payment lands.",
    built: true,
  },
  "agent-approval": {
    id: "agent-approval",
    name: "Agent approval required",
    description: "Pause agent-drafted invoices for your review before sending.",
    built: false,
  },
};
