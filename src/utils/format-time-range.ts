export function formatTimeRange(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}
