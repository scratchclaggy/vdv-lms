import { z } from "zod/mini";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().check(z.minLength(1, "Password is required")),
});

export type LoginInput = z.infer<typeof loginSchema>;
