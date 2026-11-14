/** Joins class names, leaving out the empty ones: cn("a", isOn && "b") */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
