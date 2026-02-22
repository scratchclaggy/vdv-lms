"use client";

import { useRouter, useSearchParams } from "next/navigation";

function toLocalDateString(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function defaultFrom(): string {
  return toLocalDateString(new Date());
}

function defaultTo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return toLocalDateString(d);
}

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");

  const fromValue = rawFrom ? rawFrom.slice(0, 10) : defaultFrom();
  const toValue = rawTo ? rawTo.slice(0, 10) : defaultTo();

  function update(key: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      if (key === "from") {
        // Interpret the date as local midnight and convert to UTC
        params.set("from", new Date(`${value}T00:00:00`).toISOString());
      } else {
        // Interpret the date as local end-of-day and convert to UTC
        params.set("to", new Date(`${value}T23:59:59.999`).toISOString());
      }
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        className="input input-bordered input-sm"
        value={fromValue}
        onChange={(e) => update("from", e.target.value)}
        aria-label="From date"
      />
      <span className="text-base-content/40 text-sm">–</span>
      <input
        type="date"
        className="input input-bordered input-sm"
        value={toValue}
        onChange={(e) => update("to", e.target.value)}
        aria-label="To date"
      />
    </div>
  );
}
