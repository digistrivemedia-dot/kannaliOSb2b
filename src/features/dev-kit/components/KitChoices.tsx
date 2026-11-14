import { useState } from "react";
import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FilterChips } from "@/components/ui/FilterChips";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Radio } from "@/components/ui/Radio";
import { Switch } from "@/components/ui/Switch";

const STATUS_CHIPS = [
  { value: "all", label: "All", count: 24 },
  { value: "received", label: "Received", count: 5 },
  { value: "waiting", label: "Waiting for customer", count: 3 },
  { value: "in_progress", label: "In progress", count: 9 },
] as const;

type ChipValue = (typeof STATUS_CHIPS)[number]["value"];

export function KitChoices() {
  const [checked, setChecked] = useState(true);
  const [method, setMethod] = useState<"cash" | "upi">("cash");
  const [isOn, setIsOn] = useState(true);
  const [chip, setChip] = useState<ChipValue>("all");
  const [quantity, setQuantity] = useState(2);
  return (
    <Section title="Choices">
      <View className="-mx-4">
        <FilterChips label="Status" options={[...STATUS_CHIPS]} value={chip} onChange={setChip} />
      </View>
      <Card className="gap-1">
        <Checkbox label="Road test done" checked={checked} onChange={setChecked} />
        <Checkbox
          label="Old parts kept for the customer"
          description="Hand them over at delivery"
          checked={false}
          onChange={() => {}}
        />
        <Checkbox label="Disabled" checked onChange={() => {}} disabled />
        <View accessibilityRole="radiogroup">
          <Radio label="Cash" selected={method === "cash"} onSelect={() => setMethod("cash")} />
          <Radio
            label="Garage's UPI"
            description="Customer pays to your UPI ID"
            selected={method === "upi"}
            onSelect={() => setMethod("upi")}
          />
        </View>
        <Switch
          label="Taking bookings"
          description="Customers can book this branch"
          value={isOn}
          onChange={setIsOn}
        />
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </Card>
    </Section>
  );
}
