import { z } from "zod";

/** Pay dues by bank transfer: at least one invoice, and the transfer's UTR. */
export const payDuesSchema = z.object({
  invoiceIds: z.array(z.string()).min(1, "Choose at least one invoice."),
  reference: z.string().trim().min(3, "Enter the UTR of your transfer."),
});
