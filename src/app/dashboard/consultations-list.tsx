import type { ConsultationWithRelations } from "@/app/consultations/types";
import { formatTimeRange } from "@/utils/format-time-range";

type Props = {
  consultations: ConsultationWithRelations[];
};

export function ConsultationsList({ consultations }: Props) {
  if (consultations.length === 0) {
    return (
      <p className="text-base-content/50 text-sm px-1 py-4">
        No consultations found for the selected date range.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-base-300">
      {consultations.map((c) => {
        const start = new Date(c.startTime);
        const end = new Date(c.endTime);

        const dateLabel = start.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const timeLabel = formatTimeRange(start, end);

        const tutorName = `${c.tutor.firstName} ${c.tutor.lastName}`;

        return (
          <li key={c.id} className="py-4 flex flex-col gap-0.5">
            <span className="font-medium text-sm text-primary">
              {tutorName}
            </span>
            <span className="text-base-content/70 text-sm">{c.reason}</span>
            <span className="text-base-content/50 text-xs">
              {dateLabel} &middot; {timeLabel}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
