import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addProgressNote,
  assignDriver,
  assignTechnician,
  collectPayment,
  createInvoice,
  getBranchStaff,
  handOver,
  checkIn,
  createWalkIn,
  finishWork,
  getGarageServices,
  getJobCard,
  getJobCards,
  getTechnicians,
  lookupVehicle,
  recordApproval,
  recordQualityCheck,
  respondToJob,
  saveInspection,
  searchParts,
  sendEstimate,
  sendRevision,
  setLineDone,
} from "@/features/jobs/api";
import type { CheckInRequest, JobCard, JobCardFilters, TripKind } from "@/features/jobs/types";
import { JOB_TABS, type JobTab } from "@/features/jobs/utils";
import { LIVE_REFETCH_MS } from "@/lib/constants";
import { nextPage } from "@/lib/paging";

type ListFilters = JobCardFilters & { from?: string; to?: string };

const jobKeys = {
  all: ["jobs"] as const,
  list: (filters: ListFilters) => ["jobs", "list", filters] as const,
  pages: (filters: ListFilters) => ["jobs", "pages", filters] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
  technicians: (branchId: string) => ["jobs", "technicians", branchId] as const,
};

type ListOptions = {
  enabled?: boolean;
  /** Looks again every 15 s, for lists on Today that should stay current. */
  live?: boolean;
};

export function useJobCards(
  filters: ListFilters,
  { enabled = true, live = false }: ListOptions = {},
) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => getJobCards(filters),
    enabled,
    refetchInterval: live ? LIVE_REFETCH_MS : false,
  });
}

/** The job list, a page at a time as it scrolls. */
export function useJobPages(filters: ListFilters) {
  return useInfiniteQuery({
    queryKey: jobKeys.pages(filters),
    queryFn: ({ pageParam }) => getJobCards({ ...filters, page: pageParam, pageSize: 20 }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

/** How many jobs the branch has in each of these tabs. One small request per tab. */
export function useJobCounts(
  branchId: string,
  tabs: readonly JobTab[],
  extra: Omit<ListFilters, "statuses" | "branchId"> = {},
) {
  return useQueries({
    queries: tabs.map((tab) => {
      const filters = { ...extra, statuses: JOB_TABS[tab].statuses, branchId, pageSize: 1 };
      return {
        queryKey: jobKeys.list(filters),
        queryFn: () => getJobCards(filters),
        refetchInterval: LIVE_REFETCH_MS,
      };
    }),
    combine: (results) => ({
      counts: Object.fromEntries(
        tabs.map((tab, index) => [tab, results[index]?.data?.total]),
      ) as Partial<Record<JobTab, number>>,
      isPending: results.some((result) => result.isPending),
      error: results.find((result) => result.error)?.error ?? null,
      refetch: () => Promise.all(results.map((result) => result.refetch())),
    }),
  });
}

export function useJobCard(id: string | null) {
  return useQuery({
    queryKey: jobKeys.detail(id ?? ""),
    queryFn: () => getJobCard(id ?? ""),
    enabled: id !== null,
  });
}

/** The vehicle on file for a plate; nothing is asked until the plate is complete. */
export function useVehicleLookup(plate: string | null) {
  return useQuery({
    queryKey: ["vehicles", "lookup", plate],
    queryFn: () => lookupVehicle(plate ?? ""),
    enabled: plate !== null,
  });
}

export function useTechnicians(branchId: string, { enabled = true } = {}) {
  return useQuery({
    queryKey: jobKeys.technicians(branchId),
    queryFn: () => getTechnicians(branchId),
    enabled,
  });
}

/**
 * After any change to a job: the card answers itself (so it shows at once), and every list and
 * count is out of date.
 */
function useJobChanged() {
  const queryClient = useQueryClient();
  return (job: JobCard) => {
    queryClient.setQueryData(jobKeys.detail(job.id), job);
    void queryClient.invalidateQueries({ queryKey: jobKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
  };
}

export function useCreateWalkIn() {
  const changed = useJobChanged();
  return useMutation({ mutationFn: createWalkIn, onSuccess: changed });
}

export function useCheckIn(id: string) {
  const changed = useJobChanged();
  return useMutation({
    mutationFn: (request: CheckInRequest) => checkIn(id, request),
    onSuccess: changed,
  });
}

export function useAssignTechnician(id: string) {
  const changed = useJobChanged();
  return useMutation({
    mutationFn: (technicianId: string) => assignTechnician(id, technicianId),
    onSuccess: changed,
  });
}

/** Every change to a job answers the job card; one hook per change keeps screens short. */
function useJobMutation<T>(id: string, change: (id: string, input: T) => Promise<JobCard>) {
  const changed = useJobChanged();
  return useMutation({ mutationFn: (input: T) => change(id, input), onSuccess: changed });
}

export const useSaveInspection = (id: string) => useJobMutation(id, saveInspection);
export const useSendEstimate = (id: string) => useJobMutation(id, sendEstimate);
export const useSendRevision = (id: string) => useJobMutation(id, sendRevision);
export const useRecordApproval = (id: string) => useJobMutation(id, recordApproval);
export const useRespondToJob = (id: string) => useJobMutation(id, respondToJob);
export const useAddProgressNote = (id: string) => useJobMutation(id, addProgressNote);
export const useRecordQualityCheck = (id: string) => useJobMutation(id, recordQualityCheck);
export const useFinishWork = (id: string) =>
  useJobMutation(id, (jobId: string, _: void) => finishWork(jobId));
export const useSetLineDone = (id: string) =>
  useJobMutation(id, (jobId: string, input: { lineId: string; isDone: boolean }) =>
    setLineDone(jobId, input.lineId, input.isDone),
  );

/** The garage's own services and prices, for owners building an estimate. */
export function useGarageServices({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["garage", "services"],
    queryFn: getGarageServices,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function usePartSearch(q: string) {
  return useQuery({
    queryKey: ["catalog", "part-search", q],
    queryFn: () => searchParts(q),
    enabled: q.length >= 2,
  });
}

export const useCreateInvoice = (id: string) =>
  useJobMutation(id, (jobId: string, _: void) => createInvoice(jobId));
export const useCollectPayment = (id: string) => useJobMutation(id, collectPayment);
export const useHandOver = (id: string) => useJobMutation(id, handOver);
export const useAssignDriver = (id: string) =>
  useJobMutation(id, (jobId: string, input: { trip: TripKind; driverId: string }) =>
    assignDriver(jobId, input.trip, input.driverId),
  );

export function useBranchStaff(branchId: string, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["jobs", "staff", branchId],
    queryFn: () => getBranchStaff(branchId),
    enabled,
  });
}
