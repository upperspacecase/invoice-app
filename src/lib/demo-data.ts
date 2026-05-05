export type Business = {
  name: string;
  email: string;
  payment: string;
  company: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  lastAmount: number;
};

export type InvoiceStatus = "sent" | "paid";

export type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  date: string;
  status: InvoiceStatus;
};

export const initialBusiness: Business = {
  name: "Studio Ltd",
  email: "hello@studio.co",
  payment: "Wise — IBAN GB29 NWBK 6016 1331 9268 19",
  company: "Company No. 12345678",
};

export const initialClients: Client[] = [
  {
    id: "acme",
    name: "Acme Studios",
    email: "billing@acmestudios.co",
    lastAmount: 1250,
  },
  {
    id: "field-notes",
    name: "Field Notes Co",
    email: "hello@fieldnotes.co",
    lastAmount: 850,
  },
  {
    id: "forge",
    name: "Forge Atelier",
    email: "finance@forgeatelier.com",
    lastAmount: 3200,
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-014",
    clientName: "Acme Studios",
    clientEmail: "billing@acmestudios.co",
    amount: 1250,
    description: "Strategy session, April",
    date: "Apr 28",
    status: "paid",
  },
  {
    id: "INV-013",
    clientName: "Field Notes Co",
    clientEmail: "hello@fieldnotes.co",
    amount: 850,
    description: "Editorial design, issue 04",
    date: "Apr 21",
    status: "sent",
  },
  {
    id: "INV-012",
    clientName: "Forge Atelier",
    clientEmail: "finance@forgeatelier.com",
    amount: 3200,
    description: "Brand identity, phase 2",
    date: "Apr 14",
    status: "paid",
  },
];

export function nextInvoiceId(invoices: Invoice[]): string {
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
