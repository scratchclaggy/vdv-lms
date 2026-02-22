import { supabase } from "./clients";

const PASSWORD = "some password";

export async function upsertAuthUser(email: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });

  if (!error) {
    return data.user.id;
  }

  if (
    error.message.includes("already been registered") ||
    error.message.includes("already exists")
  ) {
    const { data: list, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError)
      throw new Error(`Failed to list auth users: ${listError.message}`);

    const existing = list.users.find((u) => u.email === email);
    if (!existing)
      throw new Error(`Auth user not found after conflict for email: ${email}`);

    return existing.id;
  }

  throw new Error(`Failed to create auth user ${email}: ${error.message}`);
}
