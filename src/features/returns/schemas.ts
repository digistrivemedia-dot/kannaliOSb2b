import { z } from "zod";

/** A return request: something to return, and why. */
export const returnRequestSchema = z.object({
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1) }))
    .min(1, "Choose what you're returning."),
  reason: z.string({ error: "Choose why." }).min(1, "Choose why."),
});
