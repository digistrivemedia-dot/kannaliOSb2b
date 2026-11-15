import { z } from "zod";

import type {
  EstimateLine,
  EstimateLineInput,
  EstimateLineKind,
  JobCard,
} from "@/features/jobs/types";
import { SERVICE_GST_PERCENT, sumLines } from "@/features/jobs/utils";
import { requiredText } from "@/lib/validation";

// The estimate builder's form (website job-cards `estimateSchema`, `newEstimateLine`, `toLineInput`).

export const GST_RATES = ["0", "5", "12", "18", "28"] as const;

export const estimateSchema = z.object({
  lines: z
    .array(
      z.object({
        id: z.string(),
        kind: z.enum(["labour", "service", "part", "consumable"]),
        description: requiredText("Describe the work or part."),
        partNumber: z.string(),
        quantity: z
          .string()
          .trim()
          .regex(/^[1-9]\d{0,3}$/, "Enter a quantity from 1."),
        price: z
          .string()
          .trim()
          .regex(/^\d{1,6}(\.\d{1,2})?$/, "Enter a price in rupees."),
        gst: z.enum(GST_RATES),
      }),
    )
    .min(1, "Add at least one line."),
});

export type EstimateValues = z.infer<typeof estimateSchema>;
type EstimateLineValues = EstimateValues["lines"][number];

/** An empty line of a kind; line ids must be letters, digits, "-" or "_" (the API's rule). */
export function newEstimateLine(kind: EstimateLineKind = "labour"): EstimateLineValues {
  return {
    id: `line-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    kind,
    description: "",
    partNumber: "",
    quantity: "1",
    price: "",
    gst: String(SERVICE_GST_PERCENT) as EstimateLineValues["gst"],
  };
}

/**
 * The first estimate starts with the services the customer booked (at their fixed price), the pick-up
 * and drop fee when asked for, then a line for every inspection item that needs work.
 */
export function startingLines(job: JobCard): EstimateLineValues[] {
  const booked = (job.bookedServices ?? []).map((service) => ({
    ...newEstimateLine("service"),
    id: `${job.id}-booked-${service.serviceId}`,
    description: service.name,
    price: String(service.priceInPaise / 100),
  }));
  const trips = job.pickupDrop?.feeInPaise
    ? [
        {
          ...newEstimateLine("labour"),
          id: `${job.id}-pickup-drop`,
          description: "Pick-up and drop",
          price: String(job.pickupDrop.feeInPaise / 100),
        },
      ]
    : [];
  const flagged = job.inspection?.items.filter((item) => item.result !== "ok") ?? [];
  const found = flagged.map((item) => ({
    ...newEstimateLine(item.result === "replace" ? "part" : "labour"),
    id: `${job.id}-from-${item.id}`,
    description:
      item.result === "replace" ? item.name : `${item.name}: ${item.note ?? "check and fix"}`,
  }));
  return [...booked, ...trips, ...found];
}

/** The builder's string fields → the line the API takes. */
export function toLineInput(values: EstimateLineValues): EstimateLineInput {
  return {
    id: values.id,
    kind: values.kind,
    description: values.description.trim(),
    partNumber: values.partNumber.trim() || undefined,
    quantity: Number(values.quantity),
    unitPriceInPaise: Math.round(Number(values.price) * 100),
    gstRatePercent: Number(values.gst),
  };
}

/** Totals of the lines being built, worked out per line like the bill. Unfinished lines count as 0. */
export function sumDraftLines(lines: EstimateLineValues[]) {
  return sumLines(
    lines.map((line): EstimateLine => ({
      ...toLineInput(line),
      quantity: Number(line.quantity) || 0,
      unitPriceInPaise: Math.round((Number(line.price) || 0) * 100),
      approval: "approved",
      isExtra: false,
    })),
  );
}
