import { z } from "zod/mini";

const consultationBaseFields = {
  tutorId: z.string().check(z.minLength(1, "Please select a tutor")),
  studentId: z.string().check(z.minLength(1, "Student is required")),
  reason: z.string().check(z.minLength(1, "Please enter a reason")),
};

export const createConsultationSchema = z.object({
  ...consultationBaseFields,
  date: z.iso.date("Please select a date"),
  startTime: z.iso.time("Please enter a start time"),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;

export const createConsultationActionSchema = z.object({
  ...consultationBaseFields,
  startTime: z.iso.datetime("Please enter a valid datetime"),
});

export type CreateConsultationActionInput = z.infer<
  typeof createConsultationActionSchema
>;
