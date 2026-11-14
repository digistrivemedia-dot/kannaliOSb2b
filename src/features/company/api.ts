import type { Branch, PincodeDetails } from "@/features/company/types";
import { apiClient, orNull } from "@/lib/api-client";

/** Every branch of the business; anyone signed in may read them (the top bar shows the branch). */
export function getBranches(): Promise<Branch[]> {
  return apiClient.get<Branch[]>("/company/branches");
}

/** City and state for a PIN code, or null for one the API doesn't know yet (then they're typed). */
export function lookupPincode(pin: string): Promise<PincodeDetails | null> {
  return orNull(apiClient.get<PincodeDetails>(`/pincodes/${pin}`));
}
