// A stand-in for the backend: answers the app's fetch calls from handlers, and records them.

type Handler = (body: unknown, query: URLSearchParams) => unknown;
type Call = { method: string; path: string; body: unknown };

const EMPTY_PAGE = { items: [], page: 1, pageSize: 20, total: 0 };

/** Endpoints that answer with a plain list rather than a page; empty unless a test says otherwise. */
const LISTS: Record<string, unknown[]> = {
  "GET /notifications": [],
  "GET /company/branches": [],
  "GET /garage/technicians": [],
  "GET /garage/staff": [],
};

export function fakeApi(overrides: Record<string, Handler | object | null>) {
  const routes: Record<string, Handler | object | null> = { ...LISTS, ...overrides };
  const calls: Call[] = [];
  const respond = (status: number, data: unknown) =>
    ({
      ok: status < 400,
      status,
      text: async () => (data === undefined ? "" : JSON.stringify(data)),
    }) as Response;

  globalThis.fetch = jest.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const path = url.pathname.replace(/^\/v1\/b2b/, "");
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string" ? (JSON.parse(init.body) as unknown) : undefined;
    calls.push({ method, path, body });
    const route = routes[`${method} ${path}`];
    if (route !== undefined) {
      const data = typeof route === "function" ? (route as Handler)(body, url.searchParams) : route;
      return respond(method === "POST" && data === undefined ? 204 : 200, data);
    }
    // Lists the test doesn't care about are empty; anything else isn't there.
    if (method === "GET") return respond(200, EMPTY_PAGE);
    return respond(404, { message: `No fake for ${method} ${path}`, code: "NOT_FOUND" });
  }) as typeof fetch;

  return {
    calls,
    posted: (path: string) => calls.filter((call) => call.method === "POST" && call.path === path),
  };
}
