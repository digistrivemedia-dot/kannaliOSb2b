import { EstimateBuilder } from "@/features/jobs/components/EstimateBuilder";
import { StepNotReady } from "@/features/jobs/components/StepNotReady";
import { WithJob } from "@/features/jobs/components/WithJob";

/** G36: the first estimate, built after the inspection and sent to the customer. */
export function EstimateScreen() {
  return (
    <WithJob title="Estimate">
      {(job) =>
        job.status === "inspection" ? (
          <EstimateBuilder job={job} mode="first" />
        ) : (
          <StepNotReady
            job={job}
            title={job.estimate ? "The estimate has been sent" : "Inspect the vehicle first"}
            message={
              job.estimate
                ? "Record the customer's answer from the job card, or add extra work later."
                : "The estimate starts from what the inspection found."
            }
          />
        )
      }
    </WithJob>
  );
}
