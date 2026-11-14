import type { Branch } from "@/features/company/types";
import { apiClient } from "@/lib/api-client";

/** Every branch of the business; anyone signed in may read them (the top bar shows the branch). */
export function getBranches(): Promise<Branch[]> {
  return apiClient.get<Branch[]>("/company/branches");
}
