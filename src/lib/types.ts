export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "JPY";

export type Business = {
  name: string;
  email: string;
  payment: string;
  company: string;
  currency: CurrencyCode;
  brandColor?: string;
  logoUrl?: string;
  onboarded: boolean;
  stripeAccountId?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  lastAmount: number;
  currency: CurrencyCode;
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
  sentAt: number;
  // When payment is due, in ms. Drives the whole chase cadence. Always present
  // on read (normaliseInvoice backfills sentAt + 14d for legacy docs).
  dueAt: number;
  paidAt?: number;
  lastReminderAt?: number;
  reminderCount?: number;
  // The deepest cadence stage already sent (0 heads-up … 3 final). The cron
  // sends the next stage only when a deeper one has come due than this.
  lastStage?: number;
  // "created" = built in Nudge; "uploaded" = tradie's own PDF. Default created.
  source?: "created" | "uploaded";
  // Storage path of the uploaded PDF (uploaded invoices only).
  pdfPath?: string;
  // The tradie's own invoice number (e.g. "#1268"); shown via displayId().
  // Internal `id` stays INV-xxx for routing.
  externalNumber?: string;
  paymentLinkUrl?: string;
  stripePaymentLinkId?: string;
  // 1% (annual-capped) platform fee attached to this invoice's pay link, in
  // minor units of the invoice currency. Recorded against the yearly cap once
  // the invoice is paid (platformFeeRecorded guards against double-counting).
  platformFeeMinor?: number;
  platformFeeRecorded?: boolean;
};

// Follow-up cadence stages: 0 pre-due heads-up, 1 polite, 2 firm, 3 final.
export type FollowupStage = 0 | 1 | 2 | 3;

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
  apiKeys: ApiKey[];
  automations: Automation[];
  activity: ActivityEvent[];
};
