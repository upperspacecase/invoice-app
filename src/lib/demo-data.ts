import type { Automation, Business } from "./types";

export const initialBusiness: Business = {
  name: "Your business",
  email: "",
  payment: "",
  company: "",
  currency: "USD",
  onboarded: true,
};

export const initialAutomations: Automation[] = [
  {
    id: "auto-remind",
    title: "Auto-remind unpaid invoices",
    body: "Chase unpaid invoices around their due date — a friendly heads-up before, firmer follow-ups after.",
    enabled: true,
  },
];

export function nextInvoiceId(invoices: { id: string }[]): string {
  const numbers = invoices
    .map((inv) => parseInt(inv.id.replace(/\D/g, ""), 10))
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 14;
  return `INV-${String(max + 1).padStart(3, "0")}`;
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

export function formatLabel(at: number): string {
  return new Date(at).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}
