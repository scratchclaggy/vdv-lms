"use client";

import { useState } from "react";
import { createConsultationAction } from "@/app/consultations/create-consultation-action";
import { createConsultationSchema } from "@/app/consultations/create-consultation-schema";
import type { Tutor } from "@/app/consultations/get-tutors-action";
import { useAppForm } from "@/components/form/use-app-form";
import { isActionError } from "@/utils/action-result";

interface Props {
  currentUserId: string;
  defaultDate: string;
  tutors: Tutor[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateConsultationForm({
  currentUserId,
  defaultDate,
  tutors,
  onSuccess,
  onCancel,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      tutorId: "",
      studentId: currentUserId,
      reason: "",
      date: defaultDate,
      startTime: "09:00",
    },
    validators: {
      onChange: createConsultationSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      // Convert local date + time to a UTC ISO string entirely client-side.
      // new Date(`${date}T${time}`) is interpreted as local time by the browser.
      const startTimeUtc = new Date(
        `${value.date}T${value.startTime}`,
      ).toISOString();
      const result = await createConsultationAction({
        tutorId: value.tutorId,
        studentId: value.studentId,
        reason: value.reason,
        startTime: startTimeUtc,
      });
      if (isActionError(result)) {
        setServerError(result.error);
      } else {
        onSuccess();
      }
    },
  });

  const tutorOptions = tutors.map((t) => ({
    value: t.id,
    label: `${t.firstName} ${t.lastName}`,
  }));

  return (
    <>
      {serverError && (
        <div role="alert" className="alert alert-error mb-4">
          <span>{serverError}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.AppForm>
          <form.AppField name="tutorId">
            {(field) => (
              <field.SelectField
                label="Tutor"
                options={tutorOptions}
                placeholder="Select a tutor"
              />
            )}
          </form.AppField>

          <form.AppField name="reason">
            {(field) => (
              <field.TextField
                label="Reason"
                placeholder="e.g. Algebra revision"
              />
            )}
          </form.AppField>

          <form.AppField name="date">
            {(field) => <field.DateField label="Date" />}
          </form.AppField>

          <form.AppField name="startTime">
            {(field) => <field.TimeField label="Start time" />}
          </form.AppField>

          <div className="modal-action mt-2">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <form.SubmitButton label="Schedule" />
          </div>
        </form.AppForm>
      </form>
    </>
  );
}
