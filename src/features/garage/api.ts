import type { GarageProfile } from "@/features/garage/types";
import { apiClient } from "@/lib/api-client";

/** The garage's profile (owners: `garage:setup`). */
export function getGarageProfile(): Promise<GarageProfile> {
  return apiClient.get<GarageProfile>("/garage/profile");
}

export function saveGarageProfile(profile: GarageProfile): Promise<GarageProfile> {
  return apiClient.put<GarageProfile>("/garage/profile", profile);
}
