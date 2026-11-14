import type { VehicleType } from "@/features/jobs/types";
import type { ListParams } from "@/lib/types";

// Copied from spareXB2B/src/features/catalog/types.ts (vehicle types as the backend has them, F-14).

export type Category = { id: string; name: string };

export type VehicleModel = { id: string; type: VehicleType; brand: string; model: string };

/** Units available for delivery to one of the business's branches. */
export type BranchStock = { branchId: string; quantity: number };

export type ProductSpec = { label: string; value: string };

export type Product = {
  id: string;
  partNumber: string;
  name: string;
  brand: string;
  category: Category;
  description: string;
  hsnCode: string;
  gstRatePercent: number;
  /** MRP per unit, including GST. */
  mrpInPaise: number;
  /** The consumer site's price per unit, excluding GST. */
  b2cPriceInPaise: number;
  /** This business's price per unit, excluding GST: the B2C price less its business discount. */
  businessPriceInPaise: number;
  /** What one unit is, e.g. "bottle", "pair", "kit". */
  unit: string;
  packSize: number;
  packName?: string;
  stockByBranch: BranchStock[];
  /** Empty means the part is universal. */
  compatibleVehicles: VehicleModel[];
  images: string[];
  specs: ProductSpec[];
};

export type CatalogFilters = ListParams<"name" | "price"> & {
  /** Matches name, part number or brand. */
  q?: string;
  categoryId?: string;
  brands?: string[];
  vehicleType?: VehicleType;
  vehicleBrand?: string;
  vehicleId?: string;
  /** Only parts with stock at this delivery branch. */
  inStockAtBranchId?: string;
};

export type CatalogFilterOptions = {
  categories: Category[];
  brands: string[];
  vehicleModels: VehicleModel[];
};

/** A banner on the shop (`GET /promotions/offers`). */
export type Offer = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
};
