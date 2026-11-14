import { can } from "@/features/auth/permissions";
import { useSession } from "@/features/auth/store";
import { useBranchStore } from "@/features/company/branch-store";
import { useBranches } from "@/features/company/queries";
import type { BranchRef } from "@/features/company/types";

/**
 * The branch every garage screen follows: the one an owner picked in the switcher, or the branch the
 * user works at. The name is empty until the branch list has loaded.
 */
export function useActiveBranch(): BranchRef {
  const session = useSession();
  const chosen = useBranchStore((state) => state.branchId);
  const { data: branches } = useBranches();
  const canSwitch = can(session.roles, "garage:all_branches");
  // A branch chosen earlier may have been removed since; fall back to the user's own.
  const isKnown = !branches || branches.some((branch) => branch.id === chosen);
  const id = canSwitch && chosen && isKnown ? chosen : session.branchId;
  return { id, name: branches?.find((branch) => branch.id === id)?.name ?? "" };
}
