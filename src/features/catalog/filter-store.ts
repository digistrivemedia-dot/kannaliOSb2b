import { create } from "zustand";

import type { VehicleType } from "@/features/jobs/types";

export type ProductFilters = {
  categoryId?: string;
  brand?: string;
  vehicleType?: VehicleType;
  vehicleBrand?: string;
  vehicleId?: string;
  inStockOnly: boolean;
};

type ProductFilterStore = ProductFilters & {
  set: (filters: ProductFilters) => void;
};

/** The product list's filters, shared with its Filters sheet. */
export const useProductFilters = create<ProductFilterStore>((set) => ({
  inStockOnly: false,
  set: (filters) =>
    set({
      categoryId: filters.categoryId,
      brand: filters.brand,
      vehicleType: filters.vehicleType,
      vehicleBrand: filters.vehicleBrand,
      vehicleId: filters.vehicleId,
      inStockOnly: filters.inStockOnly,
    }),
}));

export function countFilters(filters: ProductFilters): number {
  return [
    filters.categoryId,
    filters.brand,
    filters.vehicleType,
    filters.inStockOnly || undefined,
  ].filter(Boolean).length;
}
