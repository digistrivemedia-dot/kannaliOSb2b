import { apiBaseUrl } from "@/lib/config";
import { REQUEST_TIMEOUT_MS } from "@/lib/constants";
import { getToken } from "@/lib/secure-token";

type QueryValue = string | number | boolean | null | undefined;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Extra headers, such as an application's access key. */
  headers?: Record<string, string>;
};

/** The error body every endpoint returns. Field messages are keyed by field name. */
type ApiErrorBody = {
  message: string;
  code: string;
  fieldErrors?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Called on a 401 so the app signs the user out. Set once by the auth feature. */
let onUnauthorized: () => void = () => {};

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const params = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return `${apiBaseUrl}/v1/b2b${path}${params ? `?${params}` : ""}`;
}

function isErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === "object" && data !== null && "message" in data && "code" in data;
}

const NO_CONNECTION = new ApiError(
  0,
  "network",
  "Couldn't reach Kannali Garage. Check your internet and try again.",
);

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, headers } = options;
  // Outside development the API must be HTTPS (CLAUDE.md §10).
  if (!__DEV__ && !apiBaseUrl.startsWith("https://")) {
    throw new ApiError(0, "insecure-url", "The app isn't set up to reach Kannali Garage.");
  }
  const token = await getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw NO_CONNECTION;
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  const data: unknown = text ? safeParse(text) : undefined;

  if (!response.ok) {
    // An expired or revoked session. Sign-in calls handle their own 401s.
    if (response.status === 401 && !path.startsWith("/auth/sign-in") && token) onUnauthorized();
    if (isErrorBody(data)) {
      throw new ApiError(response.status, data.code, data.message, data.fieldErrors);
    }
    throw new ApiError(response.status, "unknown", "Something went wrong on our side. Please try again.");
  }
  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

type Headers = Record<string, string>;

export const apiClient = {
  get: <T>(path: string, query?: Record<string, QueryValue>, headers?: Headers) =>
    request<T>(path, { query, headers }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown, headers?: Headers) =>
    request<T>(path, { method: "PUT", body, headers }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Resolves to null when the record doesn't exist (404), so screens can show "not found". */
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** A message that is safe to show the user for any thrown error. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong on our side. Please try again.";
}
