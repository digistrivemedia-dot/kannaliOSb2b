import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/features/auth/api";
import { useAuth } from "@/features/auth/store";
import {
  createBranch,
  createCompanyUser,
  deleteBranch,
  getBranches,
  getCompanyUser,
  getCompanyUsers,
  getGarageBranches,
  lookupPincode,
  makeMainBranch,
  resendInvite,
  setAcceptingBookings,
  setCompanyUserStatus,
  updateBranch,
  updateBusinessContact,
  updateCompanyUser,
} from "@/features/company/api";
import type { BranchInput, CompanyUserInput } from "@/features/company/types";

const companyKeys = {
  branches: ["company", "branches"] as const,
  garageBranches: ["company", "garage-branches"] as const,
  users: ["company", "users"] as const,
  user: (id: string) => ["company", "users", id] as const,
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

export function useGarageBranches({ enabled = true } = {}) {
  return useQuery({ queryKey: companyKeys.garageBranches, queryFn: getGarageBranches, enabled });
}

export function useCompanyUsers() {
  return useQuery({ queryKey: companyKeys.users, queryFn: getCompanyUsers });
}

export function useCompanyUser(id: string | null) {
  return useQuery({
    queryKey: companyKeys.user(id ?? ""),
    queryFn: () => getCompanyUser(id ?? ""),
    enabled: id !== null,
  });
}

/** After a change to the company: its lists, and the branches every screen reads. */
function useRefreshCompany() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["company"] });
}

export function useSaveBranch(id: string | null) {
  const refresh = useRefreshCompany();
  return useMutation({
    mutationFn: (input: BranchInput) => (id ? updateBranch(id, input) : createBranch(input)),
    onSuccess: refresh,
  });
}

export function useDeleteBranch() {
  const refresh = useRefreshCompany();
  return useMutation({ mutationFn: deleteBranch, onSuccess: refresh });
}

export function useMakeMainBranch() {
  const refresh = useRefreshCompany();
  return useMutation({ mutationFn: makeMainBranch, onSuccess: refresh });
}

export function useSetAcceptingBookings() {
  const refresh = useRefreshCompany();
  return useMutation({
    mutationFn: ({ id, isAccepting }: { id: string; isAccepting: boolean }) =>
      setAcceptingBookings(id, isAccepting),
    onSuccess: refresh,
  });
}

/** The business's contact; the session holds the business, so it is read again afterwards. */
export function useUpdateBusinessContact() {
  return useMutation({
    mutationFn: updateBusinessContact,
    onSuccess: async () => {
      const session = await authApi.getSession();
      useAuth.setState({ session });
    },
  });
}

export function useSaveCompanyUser(id: string | null) {
  const refresh = useRefreshCompany();
  return useMutation({
    mutationFn: (input: CompanyUserInput) =>
      id ? updateCompanyUser(id, input) : createCompanyUser(input),
    onSuccess: refresh,
  });
}

export function useSetCompanyUserStatus(id: string) {
  const refresh = useRefreshCompany();
  return useMutation({
    mutationFn: (status: "active" | "disabled") => setCompanyUserStatus(id, status),
    onSuccess: refresh,
  });
}

export function useResendInvite(id: string) {
  return useMutation({ mutationFn: () => resendInvite(id) });
}
