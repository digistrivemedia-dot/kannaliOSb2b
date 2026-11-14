import type { Statement } from "@/features/credit/types";
import { formatDate, formatPrice } from "@/lib/format";
import { escapeHtml as e } from "@/lib/share-pdf";

/** The credit statement for a period, as a page for the PDF. */
export function statementHtml(statement: Statement, business: string, period: string): string {
  const rows = statement.entries
    .map(
      (
        entry,
      ) => `<tr><td>${e(formatDate(entry.date))}</td><td>${e(entry.reference)}<div style="color:#475569">${e(entry.description)}</div></td>
        <td style="text-align:right">${entry.debitInPaise ? e(formatPrice(entry.debitInPaise)) : ""}</td>
        <td style="text-align:right">${entry.creditInPaise ? e(formatPrice(entry.creditInPaise)) : ""}</td>
        <td style="text-align:right">${e(formatPrice(entry.balanceInPaise))}</td></tr>`,
    )
    .join("");
  return `<html><head><meta charset="utf-8"/><style>
    body { font-family: -apple-system, Roboto, Arial, sans-serif; font-size: 12px; color: #0f172a; margin: 28px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { text-align: left; border-bottom: 2px solid #0b2545; padding: 6px 4px; } td { border-bottom: 1px solid #e2e8f0; padding: 6px 4px; }
  </style></head><body>
    <h2>Credit statement</h2><div>${e(business)} · ${e(period)}</div>
    <p>Opening balance ${e(formatPrice(statement.openingBalanceInPaise))}</p>
    <table><tr><th>Date</th><th>Entry</th><th style="text-align:right">Debit</th><th style="text-align:right">Credit</th><th style="text-align:right">Balance</th></tr>${rows}</table>
    <p><strong>Closing balance ${e(formatPrice(statement.closingBalanceInPaise))}</strong></p>
  </body></html>`;
}
