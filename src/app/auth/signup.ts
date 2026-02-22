"use server";

import { redirect } from "next/navigation";
import { signupSchema } from "@/app/auth/signup-schema";
import { createClient } from "@/supabase/server";
import { createStudent } from "./create-student";
import type { SignupInput } from "./signup-schema";

export async function signupAction(
  data: SignupInput,
): Promise<{ error: string } | undefined> {
  const result = signupSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, firstName, lastName } = result.data;

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Signup succeeded but no user was returned" };
  }

  const studentError = await createStudent(userId, email, firstName, lastName);
  if (studentError) {
    return { error: studentError.error };
  }

  redirect("/");
}
