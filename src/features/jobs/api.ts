import type {
  CheckInRequest,
  JobCard,
  JobCardFilters,
  JobCardSummary,
  TechnicianLoad,
  VehicleLookup,
  WalkInRequest,
} from "@/features/jobs/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

const job = (id: string) => `/garage/jobs/${encodeURIComponent(id)}`;

export function getJobCards(
  filters: JobCardFilters & { from?: string; to?: string },
): Promise<Paginated<JobCardSummary>> {
  const { statuses, ...params } = filters;
  return apiClient.get<Paginated<JobCardSummary>>("/garage/jobs", {
    ...params,
    statuses: statuses?.join(","),
  });
}

/** One job card with everything done on it so far, or null if there is none. */
export function getJobCard(id: string): Promise<JobCard | null> {
  return orNull(apiClient.get<JobCard>(job(id)));
}

/** The vehicle on file with this plate and its owner, or null for a plate the garage hasn't seen. */
export async function lookupVehicle(plate: string): Promise<VehicleLookup | null> {
  const found = await apiClient.get<VehicleLookup | undefined>("/garage/vehicles/lookup", {
    plate,
  });
  return found ?? null;
}

/** Opens a job for a vehicle that arrived without a booking (status "Vehicle received"). */
export function createWalkIn(request: WalkInRequest): Promise<JobCard> {
  return apiClient.post<JobCard>("/garage/jobs", request);
}

/** Records the vehicle's condition on arrival; the job card is then open for work. */
export function checkIn(id: string, request: CheckInRequest): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/check-in`, request);
}

/** The branch's technicians and how many jobs each has on now. */
export function getTechnicians(branchId: string): Promise<TechnicianLoad[]> {
  return apiClient.get<TechnicianLoad[]>("/garage/technicians", { branchId });
}

export function assignTechnician(id: string, technicianId: string): Promise<JobCard> {
  return apiClient.put<JobCard>(`${job(id)}/technician`, { technicianId });
}
