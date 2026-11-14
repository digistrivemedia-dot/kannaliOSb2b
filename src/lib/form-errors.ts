import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError, errorMessage } from "@/lib/api-client";

/**
 * Puts the API's field messages on the form's fields. Returns the message for the whole form, or
 * null when every problem was shown on a field.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  fields: readonly Path<T>[],
  setError: UseFormSetError<T>,
): string | null {
  if (!(error instanceof ApiError) || !error.fieldErrors) return errorMessage(error);
  let isShown = false;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const known = fields.find((name) => name === field);
    if (known && messages[0]) {
      setError(known, { message: messages[0] });
      isShown = true;
    }
  }
  return isShown ? null : error.message;
}
