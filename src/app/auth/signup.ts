"use server";

import {
  createServerValidate,
  ServerValidateError,
} from "@tanstack/react-form-nextjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { createStudent } from "./create-student";
import { signupFormOptions } from "./form-options";

const signupSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const serverValidateSignup = createServerValidate({
  ...signupFormOptions,
  onServerValidate: ({ value }) => {
    const result = signupSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
  },
});

export async function signupAction(_prev: unknown, formData: FormData) {
  try {
    await serverValidateSignup(formData);
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return {
      errorMap: {},
      errors: [error.message],
      values: { email, password, firstName, lastName, confirmPassword: "" },
    };
  }

  const userId = data.user?.id;
  if (!userId) {
    return {
      errorMap: {},
      errors: ["Signup succeeded but no user was returned"],
      values: { email, password, firstName, lastName, confirmPassword: "" },
    };
  }

  const studentError = await createStudent(userId, email, firstName, lastName);
  if (studentError) {
    return {
      errorMap: {},
      errors: [studentError.error],
      values: { email, password, firstName, lastName, confirmPassword: "" },
    };
  }

  redirect("/");
}
