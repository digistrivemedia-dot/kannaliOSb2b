import { useState } from "react";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Timeline } from "@/components/ui/Timeline";
import type { JobCard } from "@/features/jobs/types";
import { getJobSteps } from "@/features/jobs/utils";

/** The latest steps show; the whole history opens on request. */
const SHOWN_STEPS = 3;

export function JobHistory({ job }: { job: JobCard }) {
  const [showAll, setShowAll] = useState(false);
  const steps = getJobSteps(job);
  const hidden = steps.length - SHOWN_STEPS;
  return (
    <Section
      title="History"
      action={
        hidden > 0
          ? {
              label: showAll ? "Show less" : `Show all ${steps.length}`,
              onPress: () => setShowAll((value) => !value),
            }
          : undefined
      }
    >
      <Card>
        <Timeline steps={showAll || hidden <= 0 ? steps : steps.slice(-SHOWN_STEPS)} />
      </Card>
    </Section>
  );
}
