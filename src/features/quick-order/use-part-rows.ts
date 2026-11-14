import { useState } from "react";

import { stockAt } from "@/features/cart/use-cart-lines";
import { usePartNumberLookup } from "@/features/catalog/queries";
import type { Product } from "@/features/catalog/types";
import { formatCount } from "@/lib/format";
import { useDebounced } from "@/lib/use-debounced";

export type PartRow = { id: string; partNumber: string; quantity: number };

/** How a row stands against the catalogue and the delivery branch (website quick-order `checkLine`). */
export type RowCheck =
  | { status: "empty" }
  | { status: "checking" }
  | { status: "not_found"; message: string }
  | { status: "out_of_stock"; product: Product; message: string }
  | { status: "limited_stock"; product: Product; stock: number; message: string }
  | { status: "ready"; product: Product };

let nextId = 1;
const newRow = (partNumber = "", quantity = 1): PartRow => ({
  id: `row-${nextId++}`,
  partNumber,
  quantity,
});
const normalise = (partNumber: string) => partNumber.trim().toUpperCase();

/**
 * "AMA93795 4", "AMA93795, 4" or "AMA93795<tab>4", one per line (copied from a spreadsheet or a
 * message). A line without a number orders one.
 */
export function parsePastedList(text: string): PartRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [partNumber = "", quantity] = line.split(/[\s,;]+/);
      const parsed = Number(quantity);
      return newRow(normalise(partNumber), Number.isInteger(parsed) && parsed > 0 ? parsed : 1);
    });
}

/** Rows of part numbers and quantities, checked against the catalogue as they're typed. */
export function usePartRows({ branchId, checkStock }: { branchId: string; checkStock: boolean }) {
  const [rows, setRows] = useState<PartRow[]>(() => [newRow(), newRow(), newRow()]);
  const numbers = useDebounced(
    [
      ...new Set(rows.map((row) => normalise(row.partNumber)).filter((value) => value.length >= 3)),
    ].sort(),
    500,
  );
  const lookup = usePartNumberLookup(numbers);
  const byNumber = new Map(
    (lookup.data ?? []).map((product) => [product.partNumber.toUpperCase(), product]),
  );

  const check = (row: PartRow): RowCheck => {
    const partNumber = normalise(row.partNumber);
    if (!partNumber) return { status: "empty" };
    if (!numbers.includes(partNumber) || lookup.isFetching) return { status: "checking" };
    const product = byNumber.get(partNumber);
    if (!product)
      return { status: "not_found", message: `No part number "${partNumber}" in the catalogue` };
    if (!checkStock) return { status: "ready", product };
    const stock = stockAt(product, branchId);
    if (stock === 0)
      return { status: "out_of_stock", product, message: "None at your branch: won't be added" };
    if (row.quantity > stock) {
      return {
        status: "limited_stock",
        product,
        stock,
        message: `Only ${formatCount(stock, product.unit)} at your branch`,
      };
    }
    return { status: "ready", product };
  };

  const checks = rows.map((row) => ({ row, check: check(row) }));
  return {
    rows: checks,
    update: (id: string, change: Partial<PartRow>) =>
      setRows((current) => current.map((row) => (row.id === id ? { ...row, ...change } : row))),
    remove: (id: string) =>
      setRows((current) =>
        current.length > 1 ? current.filter((row) => row.id !== id) : [newRow()],
      ),
    addRow: () => setRows((current) => [...current, newRow()]),
    paste: (text: string) => {
      const pasted = parsePastedList(text);
      if (pasted.length)
        setRows((current) => [...current.filter((row) => row.partNumber.trim()), ...pasted]);
    },
    reset: () => setRows([newRow(), newRow(), newRow()]),
    ready: checks.flatMap(({ row, check: result }) =>
      result.status === "ready" ? [{ productId: result.product.id, quantity: row.quantity }] : [],
    ),
  };
}
