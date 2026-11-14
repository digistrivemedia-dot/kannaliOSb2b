import { useQuery } from "@tanstack/react-query";

import { getBranches, lookupPincode } from "@/features/company/api";

export const companyKeys = {
  branches: ["company", "branches"] as const,
  pincode: (pin: string) => ["pincodes", pin] as const,
};

export function useBranches() {
  return useQuery({ queryKey: companyKeys.branches, queryFn: getBranches, staleTime: 5 * 60_000 });
}

/** City and state for a full 6-digit PIN; nothing is asked for until all six digits are in. */
export function usePincode(pin: string) {
  return useQuery({
    queryKey: companyKeys.pincode(pin),
    queryFn: () => lookupPincode(pin),
    enabled: /^[1-9]\d{5}$/.test(pin),
    staleTime: Infinity,
  });
}
