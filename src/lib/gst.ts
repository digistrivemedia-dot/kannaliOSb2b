/** GST on an amount excluding GST, rounded to the nearest paisa (spareXB2B/src/lib/gst.ts). */
export function calculateGst(amountInPaise: number, ratePercent: number): number {
  return Math.round((amountInPaise * ratePercent) / 100);
}
