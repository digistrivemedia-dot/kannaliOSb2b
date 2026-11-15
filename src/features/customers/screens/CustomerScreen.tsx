import { Phone, UserRound } from "lucide-react-native";
import { View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { VehicleHistoryCard } from "@/features/customers/components/VehicleHistoryCard";
import { useCustomer } from "@/features/customers/queries";
import { useVehicleLookup } from "@/features/jobs/queries";
import { formatDate, formatPhone } from "@/lib/format";
import { callPhone } from "@/lib/links";
import { useSafeParam } from "@/lib/params";

/** G83 by customer: `/customer/[id]`. */
export function CustomerScreen() {
  return <CustomerHistory customerId={useSafeParam("id")} />;
}

/** G83 by plate, from a booking whose customer isn't on file by id: `/vehicle/[plate]`. */
export function VehicleScreen() {
  const plate = useSafeParam("plate");
  const lookup = useVehicleLookup(plate);
  if (lookup.isPending) return <Loading />;
  if (lookup.isError) {
    return (
      <Screen header={<Header title="Vehicle history" />}>
        <ErrorState
          error={lookup.error}
          onRetry={() => void lookup.refetch()}
          what="this vehicle"
        />
      </Screen>
    );
  }
  if (!lookup.data) {
    return (
      <Screen header={<Header title="Vehicle history" />}>
        <EmptyState
          icon={UserRound}
          title="No history yet"
          message="This is the vehicle's first visit to your garage."
        />
      </Screen>
    );
  }
  return <CustomerHistory customerId={lookup.data.customer.id} focusPlate={plate} />;
}

/** Details (call), every vehicle and its visits; other garages' work without prices. */
function CustomerHistory({
  customerId,
  focusPlate,
}: {
  customerId: string | null;
  focusPlate?: string | null;
}) {
  const customer = useCustomer(customerId);
  if (customer.isPending) return <Loading />;
  if (customer.isError || !customer.data) {
    return (
      <Screen header={<Header title="Customer" />}>
        {customer.isError ? (
          <ErrorState
            error={customer.error}
            onRetry={() => void customer.refetch()}
            what="this customer"
          />
        ) : (
          <EmptyState
            icon={UserRound}
            title="Customer not found"
            message="They may belong to another garage."
          />
        )}
      </Screen>
    );
  }
  const person = customer.data;
  const normalise = (plate: string) => plate.replace(/\s/g, "").toUpperCase();
  // The vehicle the screen was opened for comes first.
  const vehicles = [...person.vehicles].sort(
    (a, b) =>
      Number(normalise(b.plate) === normalise(focusPlate ?? "")) -
      Number(normalise(a.plate) === normalise(focusPlate ?? "")),
  );
  return (
    <Screen
      header={<Header title={person.name} subtitle={formatPhone(person.phone)} />}
      onRefresh={customer.refetch}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            variant="secondary"
            icon={Phone}
            label={`Call ${person.name.split(" ")[0] ?? person.name}`}
            onPress={() => callPhone(person.phone)}
          />
        </BottomBar>
      }
    >
      <Card className="gap-2">
        <View className="flex-row flex-wrap items-center gap-2">
          <StatusBadge
            word={person.hasAppAccount ? "Has the SpareX app" : "No app yet"}
            tone={person.hasAppAccount ? "success" : "neutral"}
          />
        </View>
        {person.email ? <Text>{person.email}</Text> : null}
        <Text variant="small" tone="muted">
          Customer since {formatDate(person.createdAt)}
        </Text>
      </Card>
      <Section title={vehicles.length === 1 ? "Vehicle and visits" : "Vehicles and visits"}>
        {vehicles.map((vehicle) => (
          <VehicleHistoryCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </Section>
    </Screen>
  );
}

function Loading() {
  return (
    <Screen header={<Header title="Customer" />}>
      <Skeleton shape="card" className="h-24 w-full" />
      <Skeleton shape="card" className="h-48 w-full" />
    </Screen>
  );
}
