import type {
  Branch,
  BranchInput,
  Business,
  CompanyUser,
  CompanyUserInput,
  GarageBranch,
  PincodeDetails,
} from "@/features/company/types";
import { apiClient, orNull } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";

const id = (value: string) => encodeURIComponent(value);

/** Every branch of the business; anyone signed in may read them (the top bar shows the branch). */
export function getBranches(): Promise<Branch[]> {
  return apiClient.get<Branch[]>("/company/branches");
}

/** City and state for a PIN code, or null for one the API doesn't know yet (then they're typed). */
export function lookupPincode(pin: string): Promise<PincodeDetails | null> {
  return orNull(apiClient.get<PincodeDetails>(`/pincodes/${pin}`));
}

export function createBranch(input: BranchInput): Promise<Branch> {
  return apiClient.post<Branch>("/company/branches", input);
}

export function updateBranch(branchId: string, input: BranchInput): Promise<Branch> {
  return apiClient.put<Branch>(`/company/branches/${id(branchId)}`, input);
}

export function deleteBranch(branchId: string): Promise<void> {
  return apiClient.delete<void>(`/company/branches/${id(branchId)}`);
}

/** Makes a branch the business's main (default) one. */
export function makeMainBranch(branchId: string): Promise<unknown> {
  return apiClient.post(`/company/branches/${id(branchId)}/main`);
}

/** The contact email and phone: the only parts of the business it can change itself. */
export function updateBusinessContact(input: Pick<Business, "email" | "phone">): Promise<Business> {
  return apiClient.patch<Business>("/company/profile", input);
}

export function getCompanyUsers(): Promise<Paginated<CompanyUser>> {
  return apiClient.get<Paginated<CompanyUser>>("/company/users", {
    sort: "name",
    order: "asc",
    pageSize: 100,
  });
}

export function getCompanyUser(userId: string): Promise<CompanyUser | null> {
  return orNull(apiClient.get<CompanyUser>(`/company/users/${id(userId)}`));
}

/** Adds a person; they get an email to set their password. */
export function createCompanyUser(input: CompanyUserInput): Promise<CompanyUser> {
  return apiClient.post<CompanyUser>("/company/users", input);
}

export function updateCompanyUser(userId: string, input: CompanyUserInput): Promise<CompanyUser> {
  return apiClient.put<CompanyUser>(`/company/users/${id(userId)}`, input);
}

export function setCompanyUserStatus(
  userId: string,
  status: "active" | "disabled",
): Promise<CompanyUser> {
  return apiClient.post<CompanyUser>(`/company/users/${id(userId)}/status`, { status });
}

export function resendInvite(userId: string): Promise<void> {
  return apiClient.post<void>(`/company/users/${id(userId)}/invite`);
}

/** The garage's branches with their staff counts (owners: `garage:setup`). */
export function getGarageBranches(): Promise<GarageBranch[]> {
  return apiClient.get<GarageBranch[]>("/garage/branches");
}

export function setAcceptingBookings(
  branchId: string,
  isAccepting: boolean,
): Promise<GarageBranch> {
  return apiClient.put<GarageBranch>(`/garage/branches/${id(branchId)}/accepting-bookings`, {
    isAccepting,
  });
}
