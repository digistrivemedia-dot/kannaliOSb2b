import { useLocalSearchParams } from "expo-router";

/** Ids and other route values: letters, digits, dash, underscore and dot only. */
const SAFE_VALUE = /^[\w.-]{1,100}$/;

/**
 * Reads a route parameter and checks it before use (CLAUDE.md §10). Null when it's missing or not a
 * plain id, so screens show "not found" instead of using a crafted value.
 */
export function useSafeParam(name: string): string | null {
  const params = useLocalSearchParams();
  const value = params[name];
  return typeof value === "string" && SAFE_VALUE.test(value) ? value : null;
}
