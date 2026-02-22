import { z } from "zod/mini";

export const signupSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .check(z.minLength(8, "Password must be at least 8 characters")),
    confirmPassword: z.string(),
    firstName: z.string().check(z.minLength(1, "First name is required")),
    lastName: z.string().check(z.minLength(1, "Last name is required")),
  })
  .check(
    z.refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
  );

export type SignupInput = z.infer<typeof signupSchema>;
