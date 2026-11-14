import { useState } from "react";
import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { CountdownRing } from "@/components/ui/CountdownRing";
import { CountTile } from "@/components/ui/CountTile";
import { DetailRow } from "@/components/ui/DetailRow";
import { JobRow } from "@/components/ui/JobRow";
import { ListRow } from "@/components/ui/ListRow";
import { NextStepBar } from "@/components/ui/NextStepBar";
import { PlateChip } from "@/components/ui/PlateChip";
import { Price } from "@/components/ui/Price";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { Text } from "@/components/ui/Text";

const noop = () => {};

export function KitSignature() {
  // Fixed when the kit opens, so the rings count down from the full two minutes and from 50 s.
  const [deadlines] = useState(() => ({
    full: new Date(Date.now() + 120_000).toISOString(),
    urgent: new Date(Date.now() + 50_000).toISOString(),
  }));
  return (
    <>
      <Section title="Plate chip and status">
        <Card className="gap-3">
          <PlateChip plate="KA01AB1234" />
          <PlateChip plate="KA 05 MN 7781" size="large" />
          <PlateChip plate="22BH1234AA" />
          <View className="flex-row flex-wrap gap-2">
            <StatusBadge status="new" />
            <StatusBadge status="awaiting_approval" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="ready" />
            <StatusBadge status="missed" />
            <StatusBadge status="closed" />
          </View>
        </Card>
      </Section>
      <Section title="Job rows">
        <JobRow plate="KA01AB1234" vehicle="Honda Activa 6G" customer="Arjun Rao" status="quality_check" age="2 h ago" technician="Imran Khan" nextStep="Start QC" onPress={noop} />
        <JobRow plate="KA05MN7781" vehicle="Maruti Swift" customer="Lakshmi Narayan" status="awaiting_approval" age="35 min ago" onPress={noop} />
      </Section>
      <Section title="Count tiles">
        <View className="flex-row gap-3">
          <CountTile label="New bookings" count={2} urgent onPress={noop} />
          <CountTile label="Received" count={5} onPress={noop} />
        </View>
        <View className="flex-row gap-3">
          <CountTile label="Waiting for customer" count={0} onPress={noop} />
          <CountTile label="Loading" count={0} loading onPress={noop} />
        </View>
      </Section>
      <Section title="Countdown ring">
        <Card className="flex-row items-center justify-around">
          <CountdownRing deadline={deadlines.full} totalMs={120_000} />
          <CountdownRing deadline={deadlines.urgent} totalMs={120_000} />
          <CountdownRing deadline={deadlines.full} totalMs={120_000} size="large" />
        </Card>
      </Section>
      <Section title="Rows, money and people">
        <Card flush>
          <ListRow title="Branches" subtitle="2 branches" onPress={noop} />
          <ListRow title="Static row" trailing="3" divided />
        </Card>
        <Card className="gap-3">
          <Price paise={124999} gst="excl" />
          <Price paise={147499} gst="incl" size="title" />
          <DetailRow label="Odometer">18,420 km</DetailRow>
          <View className="flex-row items-center gap-2">
            <Avatar name="Imran Khan" size="small" />
            <Avatar name="Deepa S" />
            <Text>Avatars</Text>
          </View>
        </Card>
        <Card>
          <Timeline
            steps={[
              { label: "Vehicle received", when: "14 Nov, 9:10 am", state: "done" },
              { label: "Waiting for customer approval", when: "14 Nov, 10:02 am", note: "Extra work found", state: "done" },
              { label: "Service in progress", when: "14 Nov, 11:30 am", state: "current" },
            ]}
          />
        </Card>
      </Section>
      <Section title="Next step bar">
        <View className="-mx-4 gap-2">
          <NextStepBar step={{ kind: "action", label: "Record customer's answer", onPress: noop }} />
          <NextStepBar step={{ kind: "waiting", text: "With billing" }} />
          <NextStepBar step={{ kind: "done", text: "Handed over. Job completed" }} />
        </View>
      </Section>
    </>
  );
}
