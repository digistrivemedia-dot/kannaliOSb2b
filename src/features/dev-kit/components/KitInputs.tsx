import { useState } from "react";

import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PlateInput } from "@/components/ui/PlateInput";
import { SelectField } from "@/components/ui/SelectField";

const FUEL_OPTIONS = [
  { value: "empty", label: "Empty" },
  { value: "quarter", label: "¼" },
  { value: "half", label: "½" },
  { value: "three_quarters", label: "¾" },
  { value: "full", label: "Full" },
];

export function KitInputs() {
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [fuel, setFuel] = useState<string | null>(null);
  return (
    <Section title="Inputs">
      <Card className="gap-4">
        <FormAlert message="That email and password don't match. Try again." />
        <Input label="Customer name" value={name} onChangeText={setName} hint="As on their ID" />
        <Input label="With an error" value="98450" onChangeText={() => {}} error="Enter a 10-digit mobile number." />
        <Input label="Not editable" value="29AAKFS4821M1Z3" editable={false} />
        <PlateInput label="Number plate" value={plate} onChangeText={setPlate} />
        <NumberInput label="Odometer" value={odometer} onChangeText={setOdometer} suffix="km" />
        <NumberInput label="Amount received" value={amount} onChangeText={setAmount} prefix="₹" decimals />
        <PasswordInput label="Password" value={password} onChangeText={setPassword} />
        <SelectField label="Fuel level" options={FUEL_OPTIONS} value={fuel} onChange={setFuel} />
        <SelectField label="With an error" options={FUEL_OPTIONS} value={null} onChange={setFuel} error="Choose the fuel level." />
      </Card>
    </Section>
  );
}
