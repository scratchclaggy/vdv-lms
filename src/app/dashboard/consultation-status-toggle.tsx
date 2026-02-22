"use client";

import {
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateConsultationStatusAction } from "@/app/consultations/update-consultation-status-action";
import { ConsultationStatus } from "@/generated/prisma/enums";

type Props = {
  consultationId: string;
  status: ConsultationStatus;
};

export function ConsultationStatusToggle({ consultationId, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const isCompleted = status === ConsultationStatus.COMPLETED;

  function handleConfirm() {
    startTransition(async () => {
      await updateConsultationStatusAction(
        consultationId,
        isCompleted ? ConsultationStatus.PENDING : ConsultationStatus.COMPLETED,
      );
      setConfirming(false);
      router.refresh();
    });
  }

  if (isPending) {
    return <span className="loading loading-spinner loading-sm shrink-0" />;
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-base-content/60 mr-1">Confirm?</span>
        <button
          type="button"
          className="btn btn-xs btn-success btn-square"
          onClick={handleConfirm}
          aria-label={isCompleted ? "Confirm mark pending" : "Confirm complete"}
        >
          {isCompleted ? (
            <ArrowUturnLeftIcon className="size-3.5" />
          ) : (
            <CheckIcon className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          className="btn btn-xs btn-ghost btn-square"
          onClick={() => setConfirming(false)}
          aria-label="Cancel"
        >
          <XMarkIcon className="size-3.5" />
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-square btn-sm shrink-0"
        onClick={() => setConfirming(true)}
        aria-label="Mark pending"
        title="Mark pending"
      >
        <ArrowUturnLeftIcon className="size-6 text-success" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-square btn-sm shrink-0"
      onClick={() => setConfirming(true)}
      aria-label="Mark complete"
      title="Mark complete"
    >
      <CheckCircleIcon className="size-6 text-base-content/30" />
    </button>
  );
}
