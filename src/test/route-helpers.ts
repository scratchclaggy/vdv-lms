import type { User } from "@supabase/supabase-js";

export const makeAuthUser = (id: string): User => ({ id }) as User;

export const makeRequestParams = (
  id: string,
): { params: Promise<{ id: string }> } => ({
  params: Promise.resolve({ id }),
});

export const apiUrl = (
  path: string,
  params?: Record<string, string>,
): string => {
  const url = new URL(`/api${path}`, "http://localhost");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
};
