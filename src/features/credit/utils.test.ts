import { creditBlockReason } from "@/features/credit/utils";

describe("credit at checkout", () => {
  it("allows an order within what is left", () => {
    expect(
      creditBlockReason({ availableInPaise: 500_000, overdueInvoiceCount: 0 }, 500_000),
    ).toBeNull();
  });

  it("blocks an order larger than what is left", () => {
    expect(creditBlockReason({ availableInPaise: 100_000, overdueInvoiceCount: 0 }, 100_001)).toBe(
      "Only ₹1,000 of credit left.",
    );
  });

  it("blocks credit while an invoice is overdue, whatever is left", () => {
    expect(creditBlockReason({ availableInPaise: 9_000_000, overdueInvoiceCount: 1 }, 100)).toBe(
      "Pay your overdue invoices first.",
    );
  });

  it("waits for the summary before saying anything", () => {
    expect(creditBlockReason(undefined, 100)).toBeNull();
  });
});
