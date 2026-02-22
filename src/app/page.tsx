import { redirect } from "next/navigation";
import { getConsultationsAction } from "@/app/consultations/get-consultations-action";
import { getNextConsultationAction } from "@/app/consultations/get-next-consultation-action";
import { getTutorsAction } from "@/app/consultations/get-tutors-action";
import type { ConsultationWithRelations } from "@/app/consultations/types";
import { ConsultationsList } from "@/app/dashboard/consultations-list";
import { ScheduleConsultationButton } from "@/app/dashboard/create-consultation-modal";
import { DateRangePicker } from "@/app/dashboard/date-range-picker";
import { HideCompletedToggle } from "@/app/dashboard/hide-completed-toggle";
import { getDisplayName, NavBar } from "@/app/dashboard/nav-bar";
import { NextConsultationCard } from "@/app/dashboard/next-consultation-card";
import { getCurrentUser } from "@/utils/auth";
import { UnauthorizedError } from "@/utils/errors";

type Props = {
  searchParams: Promise<{ from?: string; to?: string; hideCompleted?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { from, to, hideCompleted } = await searchParams;

  const shouldHideCompleted = hideCompleted !== "false";

  let consultations: ConsultationWithRelations[];
  let nextConsultation: ConsultationWithRelations | null;
  let tutors: Awaited<ReturnType<typeof getTutorsAction>>;
  try {
    [consultations, nextConsultation, tutors] = await Promise.all([
      getConsultationsAction(from, to, shouldHideCompleted),
      getNextConsultationAction(),
      getTutorsAction(),
    ]);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <NavBar user={user} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        <h1 className="text-2xl font-semibold">
          Welcome back, {getDisplayName(user)}
        </h1>
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
            Next Consultation
          </h2>
          <NextConsultationCard consultation={nextConsultation} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
              All Consultations
            </h2>
            <div className="flex items-center gap-3">
              <HideCompletedToggle hideCompleted={shouldHideCompleted} />
              <DateRangePicker />
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body py-2 px-5">
              <ConsultationsList consultations={consultations} />
            </div>
          </div>
        </section>
      </main>
      <ScheduleConsultationButton currentUserId={user.id} tutors={tutors} />
    </div>
  );
}
