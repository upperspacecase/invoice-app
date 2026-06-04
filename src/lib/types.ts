export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "JPY";

export type DeliveryChannel =
  | "email"
  | "quickbooks"
  | "xero"
  | "slack"
  | "webhook"
  | "portal";

export type Tier = "send" | "pro" | "get-paid";

export const TIER_RANK: Record<Tier, number> = {
  send: 0,
  pro: 1,
  "get-paid": 2,
};

export type Business = {
  name: string;
  email: string;
  payment: string;
  company: string;
  currency: CurrencyCode;
  tier: Tier;
  brandColor?: string;
  logoUrl?: string;
  onboarded: boolean;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  lastAmount: number;
  currency: CurrencyCode;
  delivery: DeliveryChannel;
  deliveryHandle?: string;
};

export type InvoiceStatus = "sent" | "paid";

export type Invoice = {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  date: string;
  status: InvoiceStatus;
  channel: DeliveryChannel;
  sentAt: number;
  paidAt?: number;
  lastReminderAt?: number;
  reminderCount?: number;
  paymentLinkUrl?: string;
  stripePaymentLinkId?: string;
  // 1% (annual-capped) platform fee attached to this invoice's pay link, in
  // minor units of the invoice currency. Recorded against the yearly cap once
  // the invoice is paid (platformFeeRecorded guards against double-counting).
  platformFeeMinor?: number;
  platformFeeRecorded?: boolean;
};

// Follow-up cadence stages: 1 polite, 2 firm, 3 final.
export type FollowupStage = 1 | 2 | 3;

export type IntegrationId =
  | "quickbooks"
  | "xero"
  | "slack"
  | "stripe"
  | "webhook";

export type Integration = {
  id: IntegrationId;
  name: string;
  description: string;
  color: string;
  connected: boolean;
  account?: string;
  connectedAt?: number;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  tokenHash: string;
  createdAt: number;
  lastUsedAt?: number;
};

export type AutomationId =
  | "auto-remind"
  | "auto-mark-paid"
  | "weekly-summary"
  | "agent-approval";

export type Automation = {
  id: AutomationId;
  title: string;
  body: string;
  enabled: boolean;
};

export type ActivityActor = "you" | "agent" | "system";

export type ActivityEvent = {
  id: string;
  who: ActivityActor;
  text: string;
  meta: string;
  at: number;
};

export type AppState = {
  business: Business;
  clients: Client[];
  invoices: Invoice[];
  integrations: Integration[];
  apiKeys: ApiKey[];
  automations: Automation[];
  activity: ActivityEvent[];
};
