import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { parseFields, extractInvoiceFields } from "./extract-invoice";

describe("parseFields (defensive JSON coercion)", () => {
  it("parses a clean object", () => {
    const f = parseFields(
      JSON.stringify({
        clientName: "Harbour Property",
        clientEmail: "ap@harbour.co",
        amount: 1850,
        currency: "GBP",
        invoiceNumber: "#1268",
        issueDate: "2026-06-01",
        dueDate: "2026-06-30",
        description: "Switchboard upgrade",
      })
    );
    expect(f).toEqual({
      clientName: "Harbour Property",
      clientEmail: "ap@harbour.co",
      amount: 1850,
      currency: "GBP",
      invoiceNumber: "#1268",
      issueDate: "2026-06-01",
      dueDate: "2026-06-30",
      description: "Switchboard upgrade",
    });
  });

  it("strips ```json code fences", () => {
    const f = parseFields('```json\n{"amount": 500, "currency": "USD"}\n```');
    expect(f?.amount).toBe(500);
    expect(f?.currency).toBe("USD");
  });

  it("coerces a string amount and rejects a bad currency", () => {
    const f = parseFields('{"amount": "£1,200.50", "currency": "POUNDS"}');
    expect(f?.amount).toBeCloseTo(1200.5, 2);
    expect(f?.currency).toBeNull();
  });

  it("nulls missing/zero/invalid fields", () => {
    const f = parseFields('{"amount": 0, "issueDate": "not-a-date"}');
    expect(f?.amount).toBeNull();
    expect(f?.issueDate).toBeNull();
    expect(f?.clientName).toBeNull();
  });

  it("returns null on unparseable text", () => {
    expect(parseFields("sorry, I couldn't read it")).toBeNull();
  });
});

describe("extractInvoiceFields (mocked LLM)", () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    delete process.env.ANTHROPIC_API_KEY;
    vi.restoreAllMocks();
  });

  it("returns parsed fields from a mocked Claude response", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                clientName: "Coastline Builders",
                clientEmail: "accounts@coastline.co",
                amount: 4200,
                currency: "GBP",
                invoiceNumber: "INV-2026-44",
                issueDate: "2026-05-20",
                dueDate: "2026-06-19",
                description: "Rewire stage 2",
              }),
            },
          ],
        }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    const out = await extractInvoiceFields(Buffer.from("%PDF-fake"));
    expect(out?.clientEmail).toBe("accounts@coastline.co");
    expect(out?.amount).toBe(4200);
    expect(out?.invoiceNumber).toBe("INV-2026-44");
  });

  it("returns null when the API key is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(await extractInvoiceFields(Buffer.from("%PDF-"))).toBeNull();
  });

  it("returns null on a non-OK response", async () => {
    globalThis.fetch = vi.fn(async () => new Response("nope", { status: 500 })) as unknown as typeof fetch;
    expect(await extractInvoiceFields(Buffer.from("%PDF-"))).toBeNull();
  });

  it("returns null (never throws) when fetch rejects", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    await expect(extractInvoiceFields(Buffer.from("%PDF-"))).resolves.toBeNull();
  });
});
