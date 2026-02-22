import { z } from "zod/mini";

export const createConsultationSchema = z
  .object({
    tutorId: z.string().check(z.minLength(1, "Please select a tutor")),
    studentId: z.string().check(z.minLength(1, "Student is required")),
    reason: z.string().check(z.minLength(1, "Please enter a reason")),
    date: z.iso.date("Please select a date"),
    startTime: z.iso.time("Please enter a start time"),
    endTime: z.iso.time("Please enter an end time"),
    timezoneOffset: z.number(),
  })
  .check((ctx) => {
    const { startTime, endTime } = ctx.value;
    if (startTime < "08:00" || startTime > "18:00") {
      ctx.issues.push({
        code: "custom",
        message: "Start time must be between 8:00 am and 6:00 pm",
        path: ["startTime"],
        input: startTime,
      });
      return;
    }
    if (endTime < "08:00" || endTime > "18:00") {
      ctx.issues.push({
        code: "custom",
        message: "End time must be between 8:00 am and 6:00 pm",
        path: ["endTime"],
        input: endTime,
      });
      return;
    }
    if (startTime >= endTime) {
      ctx.issues.push({
        code: "custom",
        message: "End time must be after start time",
        path: ["endTime"],
        input: endTime,
      });
    }
  });

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
