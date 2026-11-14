import { useSession } from "@/features/auth/store";
import { useBranches } from "@/features/company/queries";
import type { BillingGarage } from "@/features/jobs/documents";
import type { JobCard } from "@/features/jobs/types";

/** The garage a job's bill and report are in the name of: the business, and the job's branch. */
export function useBillingGarage(job: Pick<JobCard, "branch">): BillingGarage {
  const { business } = useSession();
  const { data: branches } = useBranches();
  return { business, branch: branches?.find((branch) => branch.id === job.branch.id) };
}
