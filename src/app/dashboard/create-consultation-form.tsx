"use client";

import { useState } from "react";
import { createConsultationFormAction } from "@/app/consultations/create-consultation-form-action";
import { createConsultationSchema } from "@/app/consultations/create-consultation-schema";
import type { Tutor } from "@/app/consultations/get-tutors-action";
import { useAppForm } from "@/components/form/use-app-form";

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
      endTime: "10:00",
      timezoneOffset: new Date().getTimezoneOffset(),
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const result = await createConsultationFormAction(value);
      if (result?.error) {
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
          <form.AppField
            name="tutorId"
            validators={{
              onChange: ({ value }) => {
                const result =
                  createConsultationSchema.shape.tutorId.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <field.SelectField
                label="Tutor"
                options={tutorOptions}
                placeholder="Select a tutor"
              />
            )}
          </form.AppField>

          <form.AppField
            name="reason"
            validators={{
              onChange: ({ value }) => {
                const result = createConsultationSchema.shape.reason.safeParse(
                  value?.trim(),
                );
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => (
              <field.TextField
                label="Reason"
                placeholder="e.g. Algebra revision"
              />
            )}
          </form.AppField>

          <form.AppField
            name="date"
            validators={{
              onChange: ({ value }) => {
                const result =
                  createConsultationSchema.shape.date.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => <field.DateField label="Date" />}
          </form.AppField>

          <div className="grid grid-cols-2 gap-4">
            <form.AppField
              name="startTime"
              validators={{
                onChange: ({ value }) => {
                  const result = createConsultationSchema.safeParse({
                    ...form.state.values,
                    startTime: value,
                  });
                  if (!result.success) {
                    const issue = result.error.issues.find(
                      (i) => i.path[0] === "startTime",
                    );
                    return issue?.message;
                  }
                },
              }}
              listeners={{
                onChange: ({ value }) => {
                  if (!value) return;
                  const [hours, minutes] = value.split(":").map(Number);
                  const totalMinutes = Math.min(
                    hours * 60 + minutes + 60,
                    18 * 60,
                  );
                  const endHours = Math.floor(totalMinutes / 60) % 24;
                  const endMinutes = totalMinutes % 60;
                  const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
                  form.setFieldValue("endTime", endTime, {
                    dontUpdateMeta: true,
                  });
                },
              }}
            >
              {(field) => <field.TimeField label="Start time" />}
            </form.AppField>

            <form.AppField
              name="endTime"
              validators={{
                onChange: ({ value }) => {
                  const result = createConsultationSchema.safeParse({
                    ...form.state.values,
                    endTime: value,
                  });
                  if (!result.success) {
                    const issue = result.error.issues.find(
                      (i) => i.path[0] === "endTime",
                    );
                    return issue?.message;
                  }
                },
              }}
            >
              {(field) => <field.TimeField label="End time" />}
            </form.AppField>
          </div>

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
