import { CircleCheck, CircleX, Clock, FilePen, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import type { ApplicationStatus, ApprovalStatus } from "@/features/auth/types";
import { formatDateTime } from "@/lib/format";
import { toneColors, type Tone } from "@/lib/theme";

const STATES: Record<ApprovalStatus, { icon: LucideIcon; tone: Tone; title: string }> = {
  pending: { icon: Clock, tone: "info", title: "Your application is under review" },
  sent_back: { icon: FilePen, tone: "warning", title: "Kannali needs a few changes" },
  rejected: { icon: CircleX, tone: "danger", title: "Your application wasn't approved" },
  approved: { icon: CircleCheck, tone: "success", title: "Your business is approved" },
};

/** The status in words with its icon, the business and the reference to quote. */
export function ApplicationStatusCard({ application }: { application: ApplicationStatus }) {
  const state = STATES[application.status];
  const color = toneColors[state.tone];
  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: color.tint }}
        >
          <state.icon size={26} color={color.strong} />
        </View>
        <Text variant="heading" className="flex-1" accessibilityRole="header">
          {state.title}
        </Text>
      </View>
      <Text tone="muted">
        {application.application.business.name} · sent {formatDateTime(application.submittedAt)}
      </Text>
      <View className="gap-1 rounded-input bg-gray-50 p-3">
        <Text variant="label" tone="muted" sectionLabel>
          Reference
        </Text>
        <Text variant="heading" tabular selectable>
          {application.referenceNumber}
        </Text>
      </View>
    </Card>
  );
}
