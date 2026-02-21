import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/db";
import { createAdminClient } from "@/supabase/admin";
import { createClient } from "@/supabase/server";

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const validation = signUpSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!validation.success) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const { email, password, firstName, lastName } = validation.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Sign-up succeeded but no user was returned" },
      { status: 500 },
    );
  }

  try {
    await prisma.student.create({
      data: { id: userId, email, firstName, lastName },
    });
  } catch (_error) {
    const adminClient = createAdminClient();
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Failed to delete orphaned auth user during rollback", {
        userId,
        error: deleteError.message,
      });
    }
    return NextResponse.json(
      { error: "Failed to create student profile" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: userId }, { status: 201 });
}
