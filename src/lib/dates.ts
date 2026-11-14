// Typed dates (DD/MM/YYYY), copied from the customer app's non-visual helpers.

/** "2026-12-15" → "15/12/2026", the way people type a date in India. */
export function toTypedDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/** "15/12/2026" → "2026-12-15"; null when it isn't a real date. */
export function parseTypedDate(typed: string): string | null {
  const match = typed.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const isReal =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!isReal) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Adds the slashes as digits are typed: "1512" → "15/12". */
export function maskTypedDate(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)];
  return parts.filter(Boolean).join("/");
}

/** The India calendar day that many days from now, as "YYYY-MM-DD". */
export function indiaDateIn(days: number, now = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3_600_000 + days * 86_400_000).toISOString().slice(0, 10);
}
