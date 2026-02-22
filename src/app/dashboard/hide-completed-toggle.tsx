"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  hideCompleted: boolean;
};

export function HideCompletedToggle({ hideCompleted }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (hideCompleted) {
      params.set("hideCompleted", "false");
    } else {
      params.delete("hideCompleted");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="checkbox checkbox-sm"
        checked={!hideCompleted}
        onChange={toggle}
        aria-label="Show completed consultations"
      />
      <span className="text-sm text-base-content/70">Show completed</span>
    </label>
  );
}
