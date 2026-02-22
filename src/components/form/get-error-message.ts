import type { StandardSchemaV1Issue } from "@tanstack/react-form";

export type FormError = string | StandardSchemaV1Issue;

export function getErrorMessage(error: FormError): string {
  return typeof error === "string" ? error : error.message;
}
