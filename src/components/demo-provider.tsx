"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Business,
  Client,
  Invoice,
  initialBusiness,
  initialClients,
  initialInvoices,
  nextInvoiceId,
  todayLabel,
} from "@/lib/demo-data";

type DemoState = {
  business: Business;
  clients: Client[];
  invoices: Invoice[];
};

type DemoContextValue = DemoState & {
  ready: boolean;
  addInvoice: (input: {
    clientId: string;
    amount: number;
    description: string;
  }) => Invoice | null;
};

const STORAGE_KEY = "invoice-app:demo-state:v1";

const DemoContext = createContext<DemoContextValue | null>(null);

function loadState(): DemoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoState;
  } catch {
    return null;
  }
}

function saveState(state: DemoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>({
    business: initialBusiness,
    clients: initialClients,
    invoices: initialInvoices,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    if (loaded) setState(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const addInvoice = useCallback<DemoContextValue["addInvoice"]>(
    ({ clientId, amount, description }) => {
      let created: Invoice | null = null;
      setState((prev) => {
        const client = prev.clients.find((c) => c.id === clientId);
        if (!client) return prev;
        const invoice: Invoice = {
          id: nextInvoiceId(prev.invoices),
          clientName: client.name,
          clientEmail: client.email,
          amount,
          description,
          date: todayLabel(),
          status: "sent",
        };
        created = invoice;
        return { ...prev, invoices: [invoice, ...prev.invoices] };
      });
      return created;
    },
    []
  );

  return (
    <DemoContext.Provider value={{ ...state, ready, addInvoice }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
