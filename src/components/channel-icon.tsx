import { Mail, Link as LinkIcon } from "lucide-react";
import type { DeliveryChannel } from "@/lib/types";

const COLORS: Record<DeliveryChannel, string> = {
  email: "#000000",
  quickbooks: "#000000",
  xero: "#000000",
  slack: "#000000",
  webhook: "#000000",
  portal: "#000000",
};

const LABELS: Record<DeliveryChannel, string> = {
  email: "Email",
  quickbooks: "QuickBooks",
  xero: "Xero",
  slack: "Slack",
  webhook: "Webhook",
  portal: "Portal link",
};

export function channelLabel(c: DeliveryChannel): string {
  return LABELS[c];
}

export function channelColor(c: DeliveryChannel): string {
  return COLORS[c];
}

export function ChannelIcon({
  channel,
  size = 24,
  rounded = 6,
}: {
  channel: DeliveryChannel;
  size?: number;
  rounded?: number;
}) {
  const color = COLORS[channel];
  const inner =
    channel === "email" ? (
      <Mail size={Math.round(size * 0.55)} strokeWidth={1.8} />
    ) : channel === "portal" ? (
      <LinkIcon size={Math.round(size * 0.55)} strokeWidth={1.8} />
    ) : (
      <span
        style={{ fontSize: Math.round(size * 0.46), fontWeight: 600 }}
        aria-hidden
      >
        {LABELS[channel][0]}
      </span>
    );
  return (
    <span
      aria-label={LABELS[channel]}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: color,
        color: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {inner}
    </span>
  );
}
