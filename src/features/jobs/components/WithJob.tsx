import { router } from "expo-router";
import { FileQuestion } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";

import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useJobCard } from "@/features/jobs/queries";
import type { JobCard } from "@/features/jobs/types";
import { useSafeParam } from "@/lib/params";

/**
 * Loads the job a step screen works on (from the route's id) and shows the loading, error and
 * not-found states; the screen itself renders once the job is here.
 */
export function WithJob({
  title,
  children,
}: {
  title: string;
  children: (job: JobCard) => ReactNode;
}) {
  const id = useSafeParam("id");
  const query = useJobCard(id);
  if (query.data) return <>{children(query.data)}</>;
  return (
    <Screen header={<Header title={title} />}>
      {query.isPending && id !== null ? (
        <View accessible accessibilityLabel="Loading" className="gap-4">
          <Skeleton shape="card" className="h-24 w-full" />
          <Skeleton shape="card" className="h-48 w-full" />
        </View>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="this job card" />
      ) : (
        <EmptyState
          icon={FileQuestion}
          title="Job card not found"
          message="It may be at another branch, or the link is wrong."
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      )}
    </Screen>
  );
}
