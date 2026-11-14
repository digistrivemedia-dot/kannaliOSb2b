import { ClipboardList } from "lucide-react-native";
import { useState } from "react";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { PhotoGallery } from "@/components/ui/PhotoGallery";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api-client";

const noop = () => {};

const SERVER_ERROR = new ApiError(500, "internal", "Something went wrong on our side. Please try again.");
const OFFLINE_ERROR = new ApiError(0, "network", "Couldn't reach Kannali Garage. Check your internet and try again.");

export function KitStates() {
  const [photos, setPhotos] = useState<string[]>([]);
  return (
    <>
      <Section title="Photos">
        <Card className="gap-4">
          <PhotoCapture label="Vehicle photos" photos={photos} onChange={setPhotos} hint="At least one, from the front." />
          <PhotoGallery photos={photos} label="Vehicle photo" />
        </Card>
      </Section>
      <Section title="Loading">
        <Card className="gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </Card>
        <Skeleton shape="card" className="h-28 w-full" />
      </Section>
      <Section title="Empty">
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No jobs waiting"
            message="Start a job for a vehicle that came in without a booking."
            action={{ label: "New walk-in", onPress: noop }}
          />
        </Card>
      </Section>
      <Section title="Errors">
        <Card>
          <ErrorState error={SERVER_ERROR} onRetry={noop} what="the jobs" />
        </Card>
        <Card>
          <ErrorState error={OFFLINE_ERROR} onRetry={noop} />
        </Card>
      </Section>
    </>
  );
}
