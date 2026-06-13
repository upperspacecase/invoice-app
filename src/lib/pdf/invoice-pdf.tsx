import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatMoney } from "@/lib/currency";
import { displayId } from "@/lib/invoice-display";
import type { Business, Invoice } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#0a0a0a",
    backgroundColor: "#ffffff",
  },
  accentBar: {
    height: 6,
    marginBottom: 28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  invoiceLabel: {
    fontSize: 9,
    color: "rgba(10,10,10,0.55)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metaBlock: {
    width: "48%",
  },
  metaLabel: {
    fontSize: 9,
    color: "rgba(10,10,10,0.55)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
  },
  metaMuted: {
    fontSize: 10,
    color: "rgba(10,10,10,0.55)",
    marginTop: 2,
  },
  lineHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(10,10,10,0.15)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(10,10,10,0.15)",
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  lineDescCol: { flex: 1 },
  lineAmountCol: { width: 120, textAlign: "right" },
  lineColHead: {
    fontSize: 9,
    color: "rgba(10,10,10,0.55)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  line: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 9,
    color: "rgba(10,10,10,0.55)",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  totalAmount: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  payBlock: {
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(10,10,10,0.15)",
  },
  payLink: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 9,
    color: "rgba(10,10,10,0.45)",
  },
});

export type InvoicePdfInput = {
  business: Business;
  invoice: Invoice;
  paymentLinkUrl?: string;
};

export function InvoicePdf({
  business,
  invoice,
  paymentLinkUrl,
}: InvoicePdfInput) {
  const accent = business.brandColor || "#0a0a0a";
  const issued = new Date(invoice.sentAt);
  const due = new Date(invoice.dueAt);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{business.name}</Text>
            <Text style={styles.metaMuted}>{business.email}</Text>
            {business.company ? (
              <Text style={styles.metaMuted}>{business.company}</Text>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{displayId(invoice)}</Text>
            <Text style={styles.metaMuted}>
              Issued {issued.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </Text>
            <Text style={styles.metaMuted}>
              Due {due.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>From</Text>
            <Text style={styles.metaValue}>{business.name}</Text>
            <Text style={styles.metaMuted}>{business.email}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>To</Text>
            <Text style={styles.metaValue}>{invoice.clientName}</Text>
            <Text style={styles.metaMuted}>{invoice.clientEmail}</Text>
          </View>
        </View>

        <View style={styles.lineHeader}>
          <Text style={[styles.lineColHead, styles.lineDescCol]}>
            Description
          </Text>
          <Text style={[styles.lineColHead, styles.lineAmountCol]}>Amount</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.lineDescCol}>{invoice.description}</Text>
          <Text style={styles.lineAmountCol}>
            {formatMoney(invoice.amount, invoice.currency)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {formatMoney(invoice.amount, invoice.currency, { withCode: true })}
          </Text>
        </View>

        <View style={styles.payBlock}>
          <Text style={styles.metaLabel}>Pay via</Text>
          <Text style={styles.metaValue}>{business.payment}</Text>
          {paymentLinkUrl ? (
            <Text style={[styles.payLink, { backgroundColor: accent }]}>
              Pay now: {paymentLinkUrl}
            </Text>
          ) : null}
        </View>

        <Text style={styles.footer}>
          Thanks for the work. Reply to this email with any questions.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  return renderToBuffer(<InvoicePdf {...input} />);
}
