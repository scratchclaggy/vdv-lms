"use server";

import {
  createServerValidate,
  ServerValidateError,
} from "@tanstack/react-form-nextjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/supabase/server";
import { loginFormOptions } from "./form-options";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

const serverValidateLogin = createServerValidate({
  ...loginFormOptions,
  onServerValidate: ({ value }) => {
    const result = loginSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
  },
});

export async function loginAction(_prev: unknown, formData: FormData) {
  try {
    await serverValidateLogin(formData);
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      errorMap: {},
      errors: [error.message],
      values: { email, password },
    };
  }

  redirect("/");
}
