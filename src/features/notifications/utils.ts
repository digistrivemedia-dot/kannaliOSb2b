import type { Href } from "expo-router";

/** The website paths the API links to, and the app screen for each. */
const ROUTES: { pattern: RegExp; to: (id: string) => Href }[] = [
  {
    pattern: /^\/garage\/bookings\/([\w-]+)$/,
    to: (id) => ({ pathname: "/booking/[id]", params: { id } }),
  },
  {
    pattern: /^\/(?:garage\/jobs|job-cards)\/([\w-]+)/,
    to: (id) => ({ pathname: "/job/[id]", params: { id } }),
  },
  { pattern: /^\/orders\/([\w-]+)$/, to: (id) => ({ pathname: "/order/[id]", params: { id } }) },
  { pattern: /^\/returns\/([\w-]+)$/, to: (id) => ({ pathname: "/return/[id]", params: { id } }) },
  {
    pattern: /^\/quotations\/([\w-]+)$/,
    to: (id) => ({ pathname: "/quotation/[id]", params: { id } }),
  },
  {
    pattern: /^\/payments\/([\w-]+)$/,
    to: (id) => ({ pathname: "/payment/[id]", params: { id } }),
  },
];

const PAGES: Record<string, Href> = {
  "/dashboard": "/",
  "/credit": "/credit",
  "/orders": "/orders",
  "/quotations": "/quotations",
  "/documents": "/documents",
  "/payments": "/payments",
};

/** The screen a notification opens, or null when the app has none for it. */
export function notificationTarget(href: string): Href | null {
  const path = href.split(/[?#]/)[0] ?? "";
  for (const route of ROUTES) {
    const id = route.pattern.exec(path)?.[1];
    if (id) return route.to(id);
  }
  return PAGES[path] ?? null;
}
