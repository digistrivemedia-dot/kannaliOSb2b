/** A GST invoice or credit note (`GET /documents`, FRONTEND-CHANGES F-36). */
export type DocumentKind = "invoice" | "credit_note";

export type Document = {
  id: string;
  kind: DocumentKind;
  number: string;
  date: string;
  /** Including GST. */
  amountInPaise: number;
  /** What it belongs to, e.g. "Order ORD-2026-0010" and its website path. */
  relatedTo?: { label: string; href: string };
  /** A short-lived link to the PDF; null while the PDF is still being made. */
  url: string | null;
};

export type DocumentFilters = {
  kind?: DocumentKind;
  /** Matches the document number. */
  q?: string;
  from?: string;
  to?: string;
};
