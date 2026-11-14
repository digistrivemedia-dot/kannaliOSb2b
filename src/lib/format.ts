// India time everywhere. India has no daylight saving, so a fixed offset is exact, and it doesn't depend
// on how much of Intl the phone's JavaScript engine supports.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The date's parts as a clock in India shows them. */
function indiaParts(date: Date) {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth(),
    day: ist.getUTCDate(),
    weekday: ist.getUTCDay(),
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
  };
}

/** A bare "YYYY-MM-DD" is a day in India, not midnight UTC. */
function parseIso(iso: string): Date {
  return new Date(iso.length === 10 ? `${iso}T00:00:00+05:30` : iso);
}

/** 1234567 → "12,34,567", the Indian way of grouping digits. */
export function formatNumber(value: number): string {
  const [whole, fraction] = Math.abs(value).toString().split(".");
  const lastThree = whole.slice(-3);
  const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = rest ? `${rest},${lastThree}` : lastThree;
  return `${value < 0 ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

/** 12499900 → "₹1,24,999". Paise show only when the amount has them: 34560 → "₹345.60". */
export function formatPrice(paise: number): string {
  const sign = paise < 0 ? "-" : "";
  const abs = Math.abs(Math.round(paise));
  const rupees = formatNumber(Math.floor(abs / 100));
  const rest = abs % 100;
  return `${sign}₹${rupees}${rest === 0 ? "" : `.${String(rest).padStart(2, "0")}`}`;
}

/** 12, "job" → "12 jobs"; 1, "bill" → "1 bill" */
export function formatCount(count: number, noun: string): string {
  return `${formatNumber(count)} ${count === 1 ? noun : `${noun}s`}`;
}

/** 18420 → "18,420 km" */
export function formatKm(km: number): string {
  return `${formatNumber(km)} km`;
}

/** → "12 Oct 2026" */
export function formatDate(iso: string): string {
  const { day, month, year } = indiaParts(parseIso(iso));
  return `${day} ${MONTHS[month]} ${year}`;
}

/** → "3:45 pm" */
export function formatTime(iso: string): string {
  const { hours, minutes } = indiaParts(new Date(iso));
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "am" : "pm"}`;
}

/** → "Sat, 14 Nov" */
export function formatWeekday(iso: string): string {
  const { weekday, day, month } = indiaParts(parseIso(iso));
  return `${WEEKDAYS[weekday]}, ${day} ${MONTHS[month]}`;
}

/** → "12 Oct, 3:45 pm"; the year is added when it isn't this year. */
export function formatDateTime(iso: string, now = new Date()): string {
  const date = indiaParts(new Date(iso));
  const year = date.year === indiaParts(now).year ? "" : ` ${date.year}`;
  return `${date.day} ${MONTHS[date.month]}${year}, ${formatTime(iso)}`;
}

/** The India calendar day of a moment as "YYYY-MM-DD", the format the API filters by. */
export function toIndiaDate(date: Date): string {
  const { year, month, day } = indiaParts(date);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Calendar days from today (India time) to the date: 0 today, 1 tomorrow, -1 yesterday. */
export function daysFromToday(iso: string, now = new Date()): number {
  const day = (date: Date) => Date.parse(`${toIndiaDate(date)}T00:00:00Z`);
  return Math.round((day(parseIso(iso)) - day(now)) / DAY_MS);
}

/** → "Today, 4:00 pm", "Tomorrow, 10:00 am" or "12 Oct, 3:45 pm" */
export function formatWhen(iso: string, now = new Date()): string {
  const labels: Record<number, string> = { 0: "Today", 1: "Tomorrow", [-1]: "Yesterday" };
  const label = labels[daysFromToday(iso, now)];
  return label ? `${label}, ${formatTime(iso)}` : formatDateTime(iso, now);
}

/** The hour (0–23) in India, for the greeting. */
export function indiaHour(now = new Date()): number {
  return indiaParts(now).hours;
}

/** How long ago, short enough for a list row: "just now", "5 min ago", "2 h ago", "3 d ago", then a date. */
export function formatAge(iso: string, now = new Date()): string {
  const elapsed = now.getTime() - new Date(iso).getTime();
  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} min ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)} h ago`;
  if (elapsed < 7 * DAY_MS) return `${Math.floor(elapsed / DAY_MS)} d ago`;
  return formatDate(iso);
}

/** Time left on a countdown, as "1:32". Never negative. */
export function formatCountdown(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** "+919845012345" → "+91 98450 12345" */
export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "").slice(-10);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** The longest plate written without spaces, e.g. "KA01AB1234" or "22BH1234AA". */
const PLATE_MAX_LENGTH = 11;

/**
 * Formats a number plate as it is typed: capitals, and a space wherever letters and digits meet.
 * "ka01ab1234" → "KA 01 AB 1234", "22bh1234aa" → "22 BH 1234 AA".
 */
export function formatPlate(input: string): string {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, PLATE_MAX_LENGTH);
  return compact.replace(/([A-Z])(?=\d)|(\d)(?=[A-Z])/g, "$1$2 ");
}

/** "Arjun Rao" → "AR", for avatars. */
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** "Mahesh Kumar" → "Mahesh" */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
