import "server-only";

// Branded HTML email shell matching the Nudge board: cream backdrop, white
// rounded card, the goblin + wordmark, a green "View & Pay" button, and an
// "on behalf of {business}" footer. Plain text is sent alongside as the
// fallback (built by the caller).
const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://nudgeinvoicing.pro";
const GREEN = "#46b36b";
const GREEN_DEEP = "#1e3d2b";
const CREAM = "#faf4e9";
const INK = "#1e3d2b";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;"
  );
}

// Turn the message text into paragraphs, linkifying bare URLs.
function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const html = esc(block)
        .replace(
          /(https?:\/\/[^\s]+)/g,
          `<a href="$1" style="color:${GREEN_DEEP};text-decoration:underline">$1</a>`
        )
        .replace(/\n/g, "<br/>");
      return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${INK}">${html}</p>`;
    })
    .join("");
}

export type BrandedEmailOpts = {
  businessName: string;
  // The main message (greeting + body), paragraphs separated by blank lines.
  body: string;
  payUrl?: string;
  payLabel?: string;
  // Lines shown under the button (e.g. "Or pay direct: …").
  footerLines?: string[];
  // The sign-off line, e.g. "— Apex Electrical" or "Nudge — on behalf of …".
  signoff: string;
  // When true, render the "on behalf of" assistant lockup (reminders).
  onBehalf?: boolean;
};

export function brandedEmailHtml(opts: BrandedEmailOpts): string {
  const button =
    opts.payUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 18px">
           <tr><td style="border-radius:12px;background:${GREEN}">
             <a href="${esc(opts.payUrl)}" style="display:inline-block;padding:13px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px">${esc(opts.payLabel || "View & Pay Invoice")}</a>
           </td></tr>
         </table>`
      : "";
  const footer = (opts.footerLines || [])
    .filter(Boolean)
    .map(
      (l) =>
        `<p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:rgba(30,61,43,0.7)">${esc(l)}</p>`
    )
    .join("");
  const lockup = opts.onBehalf
    ? `<div style="display:flex;align-items:center;gap:8px">
         <img src="${BASE}/brand/nudge-goblin.png" width="32" height="32" alt="Nudge" style="border-radius:8px;display:block"/>
         <div style="font-size:13px;color:rgba(30,61,43,0.7)"><strong style="color:${GREEN_DEEP}">Nudge</strong> · on behalf of ${esc(opts.businessName)}</div>
       </div>`
    : `<img src="${BASE}/brand/nudge-wordmark.png" height="22" alt="Nudge" style="display:block"/>`;

  return `<!doctype html><html><body style="margin:0;padding:0;background:${CREAM}">
    <div style="background:${CREAM};padding:28px 16px">
      <table role="presentation" cellpadding="0" cellspacing="0" align="center" width="100%" style="max-width:560px;margin:0 auto">
        <tr><td style="padding:0 4px 16px">${lockup}</td></tr>
        <tr><td style="background:#ffffff;border:1px solid rgba(30,61,43,0.12);border-radius:18px;padding:28px 26px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
          ${paragraphs(opts.body)}
          ${button}
          ${footer}
          <p style="margin:16px 0 0;font-size:14px;color:${INK}">${esc(opts.signoff)}</p>
        </td></tr>
        <tr><td style="padding:14px 4px 0;font-size:11px;color:rgba(30,61,43,0.5)">Sent by Nudge · nudgeinvoicing.pro</td></tr>
      </table>
    </div>
  </body></html>`;
}
