import type { ConsultationWithRelations } from "@/app/consultations/types";
import { formatTime } from "@/utils/format-time";
import { ConsultationStatusToggle } from "./consultation-status-toggle";

type Props = {
  consultations: ConsultationWithRelations[];
};

export function ConsultationsList({ consultations }: Props) {
  if (consultations.length === 0) {
    return (
      <p className="text-base-content/50 text-sm px-1 py-4">
        No consultations found. Try adjusting the date range or showing
        completed consultations.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-base-300">
      {consultations.map((c) => {
        const start = new Date(c.startTime);

        const dateLabel = start.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const timeLabel = formatTime(start);

        const tutorName = `${c.tutor.firstName} ${c.tutor.lastName}`;

        const isCompleted = c.status === "COMPLETED";

        return (
          <li
            key={c.id}
            className={`py-4 flex items-center gap-3 transition-opacity${isCompleted ? " opacity-50" : ""}`}
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-medium text-sm text-primary">
                {tutorName}
              </span>
              <span className="text-base-content/70 text-sm">{c.reason}</span>
              <span className="text-base-content/50 text-xs">
                {dateLabel} &middot; {timeLabel}
              </span>
            </div>
            <ConsultationStatusToggle consultationId={c.id} status={c.status} />
          </li>
        );
      })}
    </ul>
  );
}
