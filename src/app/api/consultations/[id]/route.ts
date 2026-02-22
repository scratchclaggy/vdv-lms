import { type NextRequest, NextResponse } from "next/server";
import { getConsultationAction } from "@/app/consultations/get-consultation-action";
import { errorToResponse } from "@/utils/http-errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const consultation = await getConsultationAction(id);
    return NextResponse.json(consultation);
  } catch (error) {
    return errorToResponse(error, "Failed to fetch consultation");
  }
}
