import type {
  ApprovalRequest,
  CheckInRequest,
  EstimateLineInput,
  GarageService,
  InspectionRequest,
  PartMatch,
  ProgressRequest,
  QualityCheckRequest,
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

export function saveInspection(id: string, request: InspectionRequest): Promise<JobCard> {
  return apiClient.put<JobCard>(`${job(id)}/inspection`, request);
}

/** Sends the first estimate to the customer for approval. */
export function sendEstimate(id: string, lines: EstimateLineInput[]): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/estimate`, { lines });
}

/** Adds extra work to an approved estimate and sends it back to the customer. */
export function sendRevision(id: string, lines: EstimateLineInput[]): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/estimate/revision`, { lines });
}

export function recordApproval(id: string, request: ApprovalRequest): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/estimate/approval`, request);
}

/** The assigned technician accepts the job, or hands it back with a reason. */
export function respondToJob(
  id: string,
  response: { accept: true } | { accept: false; reason: string },
): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/response`, response);
}

export function setLineDone(id: string, lineId: string, isDone: boolean): Promise<JobCard> {
  return apiClient.patch<JobCard>(`${job(id)}/lines/${encodeURIComponent(lineId)}`, { isDone });
}

export function addProgressNote(id: string, request: ProgressRequest): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/progress`, request);
}

/** The technician's work is done: on to the quality check. */
export function finishWork(id: string): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/finish`);
}

export function recordQualityCheck(id: string, request: QualityCheckRequest): Promise<JobCard> {
  return apiClient.post<JobCard>(`${job(id)}/quality-check`, request);
}

/** The garage's own services and prices, from its profile (owners only: `garage:setup`). */
export async function getGarageServices(): Promise<GarageService[]> {
  const profile = await apiClient.get<{ services: GarageService[] }>("/garage/profile");
  return profile.services;
}

/** SpareX parts by name or part number (needs `catalog:view`). */
export async function searchParts(q: string): Promise<PartMatch[]> {
  const page = await apiClient.get<Paginated<PartMatch>>("/catalog/products", { q, pageSize: 20 });
  return page.items;
}
