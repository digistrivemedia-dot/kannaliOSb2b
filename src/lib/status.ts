import type { Tone } from "@/lib/theme";

/**
 * Every status the API returns, with its tone and the word people see (never the raw code). Statuses
 * shared between features (confirmed, approved, paid, ready…) mean the same thing everywhere.
 * Taken from the website's StatusBadge, with words shortened for a phone.
 */
const STATUSES = {
  // Job cards
  booked: { tone: "neutral", word: "Booked" },
  confirmed: { tone: "info", word: "Confirmed" },
  out_for_pickup: { tone: "info", word: "Out for pick-up" },
  vehicle_received: { tone: "info", word: "Received" },
  job_card_created: { tone: "info", word: "Job card open" },
  inspection: { tone: "info", word: "Inspected" },
  awaiting_approval: { tone: "warning", word: "Waiting for customer" },
  approved: { tone: "info", word: "Approved" },
  in_progress: { tone: "info", word: "In progress" },
  quality_check: { tone: "warning", word: "Ready for QC" },
  ready: { tone: "success", word: "Ready" },
  payment_pending: { tone: "warning", word: "Payment pending" },
  paid: { tone: "success", word: "Paid" },
  out_for_delivery: { tone: "info", word: "Out for delivery" },
  completed: { tone: "success", word: "Completed" },
  closed: { tone: "neutral", word: "Closed, no work" },
  // Bookings
  new: { tone: "warning", word: "New" },
  accepted: { tone: "success", word: "Accepted" },
  declined: { tone: "neutral", word: "Declined" },
  missed: { tone: "danger", word: "Missed" },
  // Estimate lines, as the customer answered them
  pending: { tone: "warning", word: "Waiting" },
  rejected: { tone: "danger", word: "Rejected" },
  // Orders
  placed: { tone: "neutral", word: "Placed" },
  processing: { tone: "info", word: "Processing" },
  packed: { tone: "info", word: "Packed" },
  shipped: { tone: "info", word: "Shipped" },
  delivered: { tone: "success", word: "Delivered" },
  cancelled: { tone: "neutral", word: "Cancelled" },
  // Payments and invoices
  due: { tone: "warning", word: "Due" },
  overdue: { tone: "danger", word: "Overdue" },
  refunded: { tone: "success", word: "Refunded" },
  successful: { tone: "success", word: "Successful" },
  awaiting_confirmation: { tone: "warning", word: "Awaiting confirmation" },
  failed: { tone: "danger", word: "Failed" },
  // Quotations
  requested: { tone: "info", word: "Requested" },
  quoted: { tone: "warning", word: "Waiting for you" },
  expired: { tone: "neutral", word: "Expired" },
} satisfies Record<string, { tone: Tone; word: string }>;

export type Status = keyof typeof STATUSES;

export function statusTone(status: Status): { tone: Tone; word: string } {
  return STATUSES[status];
}
