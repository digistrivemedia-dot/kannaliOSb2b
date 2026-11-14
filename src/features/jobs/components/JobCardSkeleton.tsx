import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

/** The shape of a job card while it loads. */
export function JobCardSkeleton() {
  return (
    <View accessible accessibilityLabel="Loading the job card" className="gap-6">
      <Card className="gap-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </Card>
      <Skeleton className="h-2 w-full" />
      {[0, 1, 2].map((key) => (
        <View key={key} className="gap-3">
          <Skeleton className="h-4 w-24" />
          <Card className="gap-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </Card>
        </View>
      ))}
    </View>
  );
}
