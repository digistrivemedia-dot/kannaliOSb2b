import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { ApplicationLookup } from "@/features/auth/components/ApplicationLookup";
import { ApplicationStatusCard } from "@/features/auth/components/ApplicationStatusCard";
import { useApplication, useSavedApplication } from "@/features/auth/queries";
import { useRegisterDraft } from "@/features/auth/register-draft-store";
import type { ApplicationStatus } from "@/features/auth/types";
import { toRegisterValues } from "@/features/auth/utils";

/** What happens after an application is sent (website `NextSteps`). */
const NEXT_STEPS = [
  {
    title: "We verify your business",
    detail: "We check your details and shop photos, usually within 1 working day.",
  },
  {
    title: "We set up your account",
    detail: "Our sales team calls to agree your business discount and, if you need it, credit.",
  },
  {
    title: "You start working",
    detail: "Your login arrives by email; set your password from the link and sign in.",
  },
];

/**
 * G06: where an application stands. Under review: what happens next. Sent back: Kannali's notes and
 * Correct and resubmit. Rejected: the reason and Apply again (filled in from the old application).
 */
export function ApplicationStatusScreen() {
  const saved = useSavedApplication();
  const query = useApplication(saved.data);
  const application = query.data;
  const [isLookingUp, setIsLookingUp] = useState(false);

  const startWizard = (status: ApplicationStatus, mode: "resubmit" | "reapply") => {
    const values = toRegisterValues(status.application);
    useRegisterDraft.getState().start({
      // Applying again starts a new application, which takes new photos.
      values: mode === "reapply" ? { ...values, photos: [], documents: [] } : values,
      mode,
      ref: mode === "resubmit" ? status.referenceNumber : null,
    });
    router.push("/register");
  };

  const mainAction =
    application?.status === "sent_back"
      ? { label: "Correct and resubmit", onPress: () => startWizard(application, "resubmit") }
      : application?.status === "rejected"
        ? { label: "Apply again", onPress: () => startWizard(application, "reapply") }
        : { label: "Back to sign in", onPress: () => router.replace("/sign-in") };

  return (
    <Screen
      header={<Header title="Your application" />}
      onRefresh={application ? query.refetch : undefined}
      bottomBar={
        <BottomBar>
          <Button size="main" label={mainAction.label} onPress={mainAction.onPress} />
        </BottomBar>
      }
    >
      {saved.isPending || (saved.data && query.isPending) ? (
        <View accessible accessibilityLabel="Loading" className="gap-3">
          <Skeleton shape="card" className="h-44 w-full" />
        </View>
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          what="your application"
        />
      ) : !application || isLookingUp ? (
        <ApplicationLookup onFound={() => setIsLookingUp(false)} />
      ) : (
        <>
          <ApplicationStatusCard application={application} />
          {application.status === "pending" && (
            <Section title="What happens next">
              <Card className="gap-4">
                {NEXT_STEPS.map((step, index) => (
                  <View key={step.title} className="flex-row gap-3">
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-navy-800">
                      <Text variant="label" tone="inverse" weight="semibold">
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text weight="semibold">{step.title}</Text>
                      <Text variant="small" tone="muted">
                        {step.detail}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </Section>
          )}
          {application.status === "sent_back" && (
            <Section title="What to change">
              <Card className="gap-2">
                {(application.reviewNotes ?? []).map((note) => (
                  <Text key={note}>• {note}</Text>
                ))}
              </Card>
            </Section>
          )}
          {application.status === "rejected" && (
            <Section title="Why">
              <Card className="gap-2">
                <Text>{application.rejectionReason ?? "Kannali didn't give a reason."}</Text>
                <Text variant="small" tone="muted">
                  You can apply again at any time; we'll fill in your earlier details.
                </Text>
              </Card>
            </Section>
          )}
          {application.status === "approved" && (
            <Text tone="muted">
              Your login details are in your email. Set your password from the link, then sign in.
            </Text>
          )}
          <Button
            variant="ghost"
            label="Check a different application"
            onPress={() => setIsLookingUp(true)}
          />
        </>
      )}
    </Screen>
  );
}
