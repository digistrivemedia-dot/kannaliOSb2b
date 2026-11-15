import type { VehicleType } from "@/features/jobs/types";

// Copied from spareXB2B/src/features/customers/types.ts; the API returns exactly these shapes.

/** A vehicle a garage has serviced, known by its number plate. */
export type CustomerVehicle = {
  id: string;
  plate: string;
  type: VehicleType;
  make: string;
  model: string;
  year?: number;
  customerId: string;
};

/** One of the garage's own customers. */
export type Customer = {
  id: string;
  name: string;
  /** E.164, e.g. "+919886044120" */
  phone: string;
  email?: string;
  /** True once the customer has the SpareX app and has added their vehicle's plate. */
  hasAppAccount: boolean;
  createdAt: string;
};

export type CustomerSummary = Customer & {
  vehicles: CustomerVehicle[];
  lastVisitAt?: string;
  jobCount: number;
};

/** A visit in a vehicle's history. Visits to other garages come without prices. */
export type ServiceVisit = {
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  garageName: string;
  /** Only for jobs at this garage. */
  jobId?: string;
  branchId?: string;
  summary: string;
  odometerKm?: number;
  /** Absent for other garages' visits. */
  totalInPaise?: number;
};

/** A vehicle with every visit on record, newest first. */
export type VehicleHistory = CustomerVehicle & { visits: ServiceVisit[] };

export type CustomerDetail = Customer & { vehicles: VehicleHistory[] };
