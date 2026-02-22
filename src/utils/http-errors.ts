import { NextResponse } from "next/server";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";

export function errorToResponse(
  error: unknown,
  fallbackMessage: string,
): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
