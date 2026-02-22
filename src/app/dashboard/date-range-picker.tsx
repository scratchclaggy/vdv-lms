"use client";

import { useRouter, useSearchParams } from "next/navigation";

function defaultFrom(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultTo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
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
        params.set("from", `${value}T00:00:00.000Z`);
      } else {
        params.set("to", `${value}T23:59:59.999Z`);
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
