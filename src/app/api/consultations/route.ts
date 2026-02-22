import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createConsultationAction } from "@/app/consultations/create-consultation-action";
import { getConsultationsAction } from "@/app/consultations/get-consultations-action";
import { isActionError } from "@/utils/action-result";
import { getCurrentUser } from "@/utils/auth";
import { errorToResponse } from "@/utils/http-errors";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  try {
    const consultations = await getConsultationsAction(from, to);
    return NextResponse.json(consultations);
  } catch (error) {
    return errorToResponse(error, "Failed to fetch consultations");
  }
}

const createSchema = z.object({
  tutorId: z.string(),
  studentId: z.string(),
  reason: z.string(),
  startTime: z.iso.datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = createSchema.safeParse(await request.json());

    if (!validation.success) {
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    const result = await createConsultationAction(validation.data);

    if (isActionError(result)) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return errorToResponse(error, "Failed to create consultation");
  }
}
