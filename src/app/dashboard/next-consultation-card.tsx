import type { ConsultationWithRelations } from "@/app/consultations/types";
import { formatTimeRange } from "@/utils/format-time-range";

type Props = {
  consultation: ConsultationWithRelations | null;
};

export function NextConsultationCard({ consultation }: Props) {
  if (!consultation) {
    return (
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body py-5">
          <p className="text-base-content/50 text-sm">
            No upcoming consultations.
          </p>
        </div>
      </div>
    );
  }

  const start = new Date(consultation.startTime);
  const end = new Date(consultation.endTime);

  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeLabel = formatTimeRange(start, end);

  const tutorName = `${consultation.tutor.firstName} ${consultation.tutor.lastName}`;

  return (
    <div className="card bg-primary/10 border border-primary/30">
      <div className="card-body py-5">
        <p className="font-semibold text-base text-primary">{tutorName}</p>
        <p className="text-base-content/70 text-sm">{consultation.reason}</p>
        <p className="text-base-content/50 text-xs">
          {dateLabel} &middot; {timeLabel}
        </p>
      </div>
    </div>
  );
}
