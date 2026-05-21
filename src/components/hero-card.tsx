"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Send, Check, Menu } from "lucide-react";
import { initialClients } from "@/lib/demo-data";

const heroClients = initialClients;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function HeroCard() {
  const [clientId, setClientId] = useState(heroClients[0].id);
  const [amount, setAmount] = useState("1,250.00");
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const client = heroClients.find((c) => c.id === clientId) ?? heroClients[0];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function handleSend() {
    if (sent) return;
    setSent(true);
    window.setTimeout(() => setSent(false), 2200);
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_30px_80px_-30px_rgba(10,10,10,0.18)] border border-neutral-200 p-6 sm:p-7 w-full">
      {/* window chrome */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-neutral-300" />
          <span className="w-3 h-3 rounded-full bg-neutral-300" />
          <span className="w-3 h-3 rounded-full bg-neutral-300" />
        </div>
        <button
          type="button"
          aria-label="Menu"
          className="w-8 h-8 rounded-md border border-neutral-200 flex items-center justify-center text-neutral-500"
        >
          <Menu size={14} />
        </button>
      </div>

      <h3 className="text-xl font-medium tracking-tight mb-6">New invoice</h3>

      {/* Step 1 */}
      <Step n={1} label="Client">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full h-14 px-3 rounded-xl border border-neutral-200 flex items-center gap-3 hover:border-neutral-400 transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 text-xs flex items-center justify-center font-medium">
              {initials(client.name)}
            </span>
            <span className="text-sm flex-1 text-left">{client.name}</span>
            <ChevronDown
              size={16}
              className={`text-neutral-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
              {heroClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setClientId(c.id);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left text-sm hover:bg-neutral-100 ${
                    c.id === clientId ? "bg-neutral-50" : ""
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 text-[11px] flex items-center justify-center font-medium">
                    {initials(c.name)}
                  </span>
                  <span className="flex-1">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Step>

      <div className="border-t border-neutral-200 my-5" />

      {/* Step 2 */}
      <Step n={2} label="Amount">
        <div className="h-14 px-3 rounded-xl border border-neutral-200 flex items-center gap-2 focus-within:border-neutral-400 transition-colors">
          <span className="text-base text-neutral-600">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
            }
            className="flex-1 bg-transparent outline-none text-base font-mono"
            aria-label="Amount"
          />
          <span className="text-xs text-neutral-400 flex items-center gap-1 pr-1">
            USD <ChevronDown size={12} />
          </span>
        </div>
      </Step>

      <div className="border-t border-neutral-200 my-5" />

      {/* Step 3 */}
      <Step n={3} label="Send invoice">
        <button
          type="button"
          onClick={handleSend}
          className={`w-full h-14 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            sent
              ? "bg-black text-white"
              : "bg-black text-white hover:bg-neutral-800"
          }`}
        >
          {sent ? (
            <>
              <Check size={16} strokeWidth={2.5} />
              Sent
            </>
          ) : (
            <>
              <Send size={14} />
              Send invoice
            </>
          )}
        </button>
        <p className="text-xs text-neutral-500 mt-3 text-center">
          PDF will be emailed to client
        </p>
      </Step>
    </div>
  );
}

function Step({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
          {n}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="pl-[34px]">{children}</div>
    </div>
  );
}
