import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/supabase/server";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const validation = loginSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!validation.success) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const { email, password } = validation.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
