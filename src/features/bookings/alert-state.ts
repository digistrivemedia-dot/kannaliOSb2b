/**
 * Which new bookings have already opened the alert in this run of the app, and whether it is open now,
 * so each booking alerts once and alerts never stack. Kept in memory: after a restart, a booking still
 * waiting for an answer alerts again, which is what the garage needs.
 */
const alerted = new Set<string>();
let isOpen = false;

export const bookingAlert = {
  shouldOpen: (bookingId: string) => !isOpen && !alerted.has(bookingId),
  opened: (bookingId: string) => {
    alerted.add(bookingId);
    isOpen = true;
  },
  closed: () => {
    isOpen = false;
  },
};
