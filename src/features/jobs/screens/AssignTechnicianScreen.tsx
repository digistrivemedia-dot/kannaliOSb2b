import { router } from "expo-router";
import { Check, UserX } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useAssignTechnician, useJobCard, useTechnicians } from "@/features/jobs/queries";
import { errorMessage } from "@/lib/api-client";
import { formatCount } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { colors } from "@/lib/theme";

/** G34 (form sheet): the branch's technicians with their open jobs; tap one to assign or reassign. */
export function AssignTechnicianScreen() {
  const id = useSafeParam("id");
  const { data: job } = useJobCard(id);
  const technicians = useTechnicians(job?.branch.id ?? "", { enabled: Boolean(job) });
  const assign = useAssignTechnician(id ?? "");

  const choose = (technicianId: string, name: string) =>
    assign.mutate(technicianId, {
      onSuccess: () => {
        showToast({ message: `${name} assigned` });
        router.back();
      },
      onError: (error) => showToast({ message: errorMessage(error), tone: "danger" }),
    });

  return (
    <View className="flex-1 bg-white">
      <Text variant="heading" accessibilityRole="header" className="px-4 pb-1 pt-6">
        {job?.technician ? "Reassign technician" : "Assign technician"}
      </Text>
      <Text variant="small" tone="muted" className="px-4 pb-2">
        The fewest open jobs first. They accept or hand it back.
      </Text>
      {technicians.isPending ? (
        <View className="gap-2 p-4" accessible accessibilityLabel="Loading">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </View>
      ) : technicians.isError ? (
        <ErrorState
          error={technicians.error}
          onRetry={() => void technicians.refetch()}
          what="the technicians"
        />
      ) : technicians.data.length === 0 ? (
        <EmptyState
          icon={UserX}
          title="No technicians at this branch"
          message="The owner adds technicians in Team."
        />
      ) : (
        <ScrollView contentContainerClassName="pb-8" accessibilityRole="radiogroup">
          {[...technicians.data]
            .sort((a, b) => a.activeJobs - b.activeJobs)
            .map((technician) => {
              const isCurrent = technician.id === job?.technician?.id;
              return (
                <Pressable
                  key={technician.id}
                  disabled={assign.isPending || isCurrent}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isCurrent, busy: assign.isPending }}
                  accessibilityLabel={`${technician.name}, ${formatCount(technician.activeJobs, "open job")}`}
                  onPress={() => choose(technician.id, technician.name)}
                  className="min-h-16 flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 active:bg-gray-50"
                >
                  <Avatar name={technician.name} />
                  <View className="flex-1">
                    <Text weight="semibold">{technician.name}</Text>
                    <Text variant="small" tone="muted">
                      {formatCount(technician.activeJobs, "open job")}
                    </Text>
                  </View>
                  {isCurrent && <Check size={24} color={colors.navy[700]} />}
                </Pressable>
              );
            })}
        </ScrollView>
      )}
    </View>
  );
}
