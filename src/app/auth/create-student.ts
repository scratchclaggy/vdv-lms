"use server";

import { prisma } from "@/db";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";

export async function createStudent(
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
): Promise<{ error: string } | null> {
  try {
    await prisma.student.create({
      data: { id: userId, email, firstName, lastName },
    });
    return null;
  } catch (_error) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    const adminClient = createAdminClient();
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error(
        "Failed to roll back Supabase user after DB error",
        deleteError,
      );
    }
    return { error: "Failed to create student profile. Please try again." };
  }
}
