import type { Branch, Business } from "@/features/company/types";
import type { JobCard } from "@/features/jobs/types";
import {
  approvedLines,
  ESTIMATE_KIND_LABELS,
  FUEL_LEVEL_LABELS,
  vehicleName,
} from "@/features/jobs/utils";
import {
  formatDate,
  formatDateTime,
  formatKm,
  formatNumber,
  formatPhone,
  formatPlate,
  formatPrice,
} from "@/lib/format";
import { escapeHtml as e } from "@/lib/share-pdf";

/** The garage that bills: its name and GSTIN (the business), and the branch's address and phone. */
export type BillingGarage = { business: Pick<Business, "name" | "gstin">; branch?: Branch };

/**
 * GST split for a bill to a vehicle owner. Garage and customer are both in Karnataka, so GST is split
 * equally into CGST and SGST (website `GarageInvoiceDocument`).
 */
export function splitGst(gstInPaise: number) {
  const cgst = Math.round(gstInPaise / 2);
  return { cgst, sgst: gstInPaise - cgst };
}

const STYLE = `
  body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; font-size: 12px; margin: 28px; }
  h1 { font-size: 20px; margin: 0; } h2 { font-size: 14px; margin: 18px 0 6px; }
  .muted { color: #475569; } .right { text-align: right; } .row { display: flex; justify-content: space-between; gap: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; border-bottom: 2px solid #0b2545; padding: 6px 4px; font-size: 11px; }
  td { border-bottom: 1px solid #e2e8f0; padding: 6px 4px; vertical-align: top; }
  .totals { width: 260px; margin-left: auto; margin-top: 10px; } .totals td { border: 0; padding: 3px 4px; }
  .grand td { border-top: 2px solid #0b2545; font-weight: 700; font-size: 14px; }
  .plate { display: inline-block; border: 2px solid #0f172a; border-radius: 4px; padding: 2px 8px; font-weight: 700; letter-spacing: 1px; }
  img { width: 140px; height: 105px; object-fit: cover; border-radius: 6px; margin: 4px; }
`;

function garageHeader({ business, branch }: BillingGarage): string {
  const address = branch
    ? [branch.address.line1, branch.address.line2, `${branch.address.city} ${branch.address.pin}`]
        .filter(Boolean)
        .join(", ")
    : "";
  return `
    <h1>${e(business.name)}${branch ? `, ${e(branch.name)}` : ""}</h1>
    <div class="muted">${e(address)}${branch ? ` · ${e(formatPhone(branch.contactPhone))}` : ""}</div>
    <div class="muted">${business.gstin ? `GSTIN ${e(business.gstin)}` : "Not GST registered"}</div>`;
}

function customerBlock(job: JobCard): string {
  return `
    <div class="row">
      <div><div class="muted">Bill to</div><strong>${e(job.customer.name)}</strong><br/>${e(formatPhone(job.customer.phone))}</div>
      <div class="right"><div class="muted">Vehicle</div><span class="plate">${e(formatPlate(job.vehicle.plate))}</span><br/>${e(vehicleName(job.vehicle))}</div>
    </div>`;
}

/** G42: the garage's tax invoice to the vehicle owner, as a page for the PDF. */
export function billHtml(job: JobCard, garage: BillingGarage): string {
  const invoice = job.invoice;
  const lines = approvedLines(job.estimate?.lines ?? []);
  const { cgst, sgst } = splitGst(invoice?.gstInPaise ?? 0);
  const rows = lines
    .map(
      (
        line,
        index,
      ) => `<tr><td>${index + 1}</td><td>${e(line.description)}<div class="muted">${e(ESTIMATE_KIND_LABELS[line.kind])}${line.partNumber ? ` · ${e(line.partNumber)}` : ""}</div></td>
        <td class="right">${formatNumber(line.quantity)}</td><td class="right">${e(formatPrice(line.unitPriceInPaise))}</td>
        <td class="right">${line.gstRatePercent}%</td><td class="right">${e(formatPrice(line.unitPriceInPaise * line.quantity))}</td></tr>`,
    )
    .join("");
  const paid = job.payment
    ? `Paid ${e(formatPrice(job.payment.amountInPaise))} ${job.payment.method === "cash" ? "in cash" : "online"} on ${e(formatDateTime(job.payment.receivedAt))}${job.payment.reference ? ` (ref ${e(job.payment.reference)})` : ""}`
    : "Not paid yet";
  return `<html><head><meta charset="utf-8"/><style>${STYLE}</style></head><body>
    ${garageHeader(garage)}
    <h2>Tax invoice ${invoice ? e(invoice.number) : ""}</h2>
    <div class="muted">${invoice ? `Date ${e(formatDate(invoice.issuedAt))} · ` : ""}Job ${e(job.number)}</div>
    <br/>${customerBlock(job)}
    <table><tr><th>#</th><th>Item</th><th class="right">Qty</th><th class="right">Rate (excl. GST)</th><th class="right">GST</th><th class="right">Amount (excl. GST)</th></tr>${rows}</table>
    <table class="totals">
      <tr><td>Subtotal (excl. GST)</td><td class="right">${e(formatPrice(invoice?.subtotalInPaise ?? 0))}</td></tr>
      <tr><td>CGST</td><td class="right">${e(formatPrice(cgst))}</td></tr>
      <tr><td>SGST</td><td class="right">${e(formatPrice(sgst))}</td></tr>
      <tr class="grand"><td>Total (incl. GST)</td><td class="right">${e(formatPrice(invoice?.totalInPaise ?? 0))}</td></tr>
    </table>
    <p>${paid}</p>
  </body></html>`;
}

/** G45: what was done, with before and after photos, as a page for the PDF. */
export function reportHtml(job: JobCard, garage: BillingGarage): string {
  const lines = approvedLines(job.estimate?.lines ?? []);
  const work = lines.filter((line) => line.kind === "labour" || line.kind === "service");
  const parts = lines.filter((line) => line.kind === "part" || line.kind === "consumable");
  const list = (items: string[]) =>
    items.length
      ? `<ul>${items.map((item) => `<li>${e(item)}</li>`).join("")}</ul>`
      : `<p class="muted">None.</p>`;
  const photos = (uris: string[]) =>
    uris
      .slice(0, 6)
      .map((uri) => `<img src="${e(uri)}"/>`)
      .join("");
  const before = job.checkIn?.photos ?? [];
  const after = [...job.progress.flatMap((note) => note.photos), ...(job.handover?.photos ?? [])];
  const check = job.qualityChecks.at(-1);
  const next = job.nextService;
  return `<html><head><meta charset="utf-8"/><style>${STYLE}</style></head><body>
    ${garageHeader(garage)}
    <h2>Service report · Job ${e(job.number)}</h2>
    ${customerBlock(job)}
    ${job.checkIn ? `<p class="muted">Came in ${e(formatDateTime(job.checkIn.at))} at ${e(formatKm(job.checkIn.odometerKm))}, fuel ${e(FUEL_LEVEL_LABELS[job.checkIn.fuelLevel])}</p>` : ""}
    <h2>Work done</h2>${list(work.map((line) => line.description))}
    <h2>Parts replaced</h2>${list(parts.map((line) => `${line.description} × ${formatNumber(line.quantity)}${line.partNumber ? ` (${line.partNumber})` : ""}`))}
    <h2>Technician and quality check</h2>
    <p>${e(job.technician?.name ?? "Not recorded")}${check ? ` · Quality check ${check.result === "pass" ? "passed" : "sent back"} by ${e(check.by.name)}, ${e(formatDateTime(check.at))}` : ""}</p>
    ${before.length || after.length ? `<h2>Before</h2>${photos(before) || '<p class="muted">No photos.</p>'}<h2>After</h2>${photos(after) || '<p class="muted">No photos.</p>'}` : ""}
    <h2>Next service due</h2>
    <p>${next?.date || next?.odometerKm ? [next.date ? formatDate(next.date) : "", next.odometerKm ? `at ${formatKm(next.odometerKm)}` : ""].filter(Boolean).map(e).join(", or ") : "Not set"}</p>
  </body></html>`;
}
