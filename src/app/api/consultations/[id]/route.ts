import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateConsultationStatusAction } from "@/app/consultations/update-consultation-status-action";
import { getCurrentUser } from "@/utils/auth";
import { errorToResponse } from "@/utils/http-errors";

const patchSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = patchSchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    const consultation = await updateConsultationStatusAction(
      id,
      validation.data.status,
    );
    return NextResponse.json(consultation);
  } catch (error) {
    return errorToResponse(error, "Failed to update consultation");
  }
}
