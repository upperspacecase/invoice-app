"use client";

import { InlineEdit } from "@/components/inline-edit";
import { updateBusinessAction } from "@/app/_actions";
import type { Business } from "@/lib/types";

export function BusinessFields({ business }: { business: Business }) {
  return (
    <div className="space-y-4">
      <InlineEdit
        label="Business name"
        value={business.name}
        onSave={(v) => updateBusinessAction({ name: v })}
      />
      <InlineEdit
        label="Email"
        value={business.email}
        onSave={(v) => updateBusinessAction({ email: v })}
      />
      <InlineEdit
        label="Company"
        value={business.company}
        onSave={(v) => updateBusinessAction({ company: v })}
      />
      <InlineEdit
        label="Payment details"
        value={business.payment}
        multiline
        onSave={(v) => updateBusinessAction({ payment: v })}
      />
    </div>
  );
}
