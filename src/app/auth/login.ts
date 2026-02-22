"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/app/auth/login-schema";
import { createClient } from "@/supabase/server";
import type { LoginInput } from "./login-schema";

export async function loginAction(
  data: LoginInput,
): Promise<{ error: string } | undefined> {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
