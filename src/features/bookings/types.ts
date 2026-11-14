import type { BranchRef } from "@/features/company/types";
import type { VehicleType } from "@/features/jobs/types";
import type { ListParams } from "@/lib/types";

// Copied from spareXB2B/src/features/bookings/types.ts; the API returns exactly these shapes.

/**
 * Bookings come from customers on the SpareX app; the garage accepts or declines them before
 * `respondBy`, or the request is missed and goes to another garage.
 */
export type BookingStatus = "new" | "accepted" | "declined" | "missed";

export type PickupDropRequest = {
  pickupAddress: string;
  /** Where to bring it back; often the same as the pick-up address. */
  dropAddress: string;
  /** The garage's flat fee when booked, excluding GST. */
  feeInPaise: number;
};

export type BookedService = {
  serviceId: string;
  name: string;
  /** The price when booked, excluding GST. */
  priceInPaise: number;
};

export type Booking = {
  id: string;
  number: string;
  status: BookingStatus;
  branch: BranchRef;
  createdAt: string;
  /** Answer a new request by then, or it is missed and the customer's booking moves on. */
  respondBy: string;
  /** The day and time the customer chose: when to bring it in, or when to pick it up. */
  slotAt: string;
  /** Present when the customer asked the garage to fetch and return the vehicle. */
  pickupDrop?: PickupDropRequest;
  customer: { name: string; phone: string; customerId?: string };
  vehicle: { plate: string; type: VehicleType; make: string; model: string; vehicleId?: string };
  services: BookedService[];
  notes?: string;
  declineReason?: string;
  /** The job card made when the booking was accepted, and its number. */
  jobId?: string;
  jobNumber?: string;
};

export type BookingFilters = ListParams<"slotAt" | "respondBy"> & {
  status?: BookingStatus;
  /** "upcoming": accepted, slot today or later. "past": declined, missed or an earlier slot. */
  view?: "upcoming" | "past";
  branchId?: string;
  /** "YYYY-MM-DD": bookings for this day only. */
  date?: string;
};
