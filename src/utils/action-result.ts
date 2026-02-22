export type ActionError = { error: string; status: number };

/**
 * Discriminated union returned by server actions that call from client forms.
 *
 * - On success: `{ data: T }`
 * - On failure: `{ error: string; status: number }`
 *
 * Actions that redirect on success (e.g. login, signup) use `ActionResult<undefined>`.
 */
export type ActionResult<T> = { data: T } | ActionError;

/** Type guard — narrows to the error branch. */
export function isActionError<T>(
  result: ActionResult<T>,
): result is ActionError {
  return "error" in result;
}
