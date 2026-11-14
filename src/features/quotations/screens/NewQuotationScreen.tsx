import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { useState } from "react";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/SelectField";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useBranches } from "@/features/company/queries";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { usePartPick } from "@/features/jobs/part-pick-store";
import { useRequestQuotation } from "@/features/quotations/queries";
import { PartNumberRows } from "@/features/quick-order/components/PartNumberRows";
import { usePartRows } from "@/features/quick-order/use-part-rows";
import { errorMessage } from "@/lib/api-client";
import { formatCount } from "@/lib/format";

/** G62: parts by part number or from the catalogue, quantities, a note → Request. Kannali prices it. */
export function NewQuotationScreen() {
  const activeBranch = useActiveBranch();
  const branches = useBranches();
  const [branchId, setBranchId] = useState(activeBranch.id);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Quotations price whatever is asked for, so stock isn't checked here.
  const parts = usePartRows({ branchId, checkStock: false });
  const request = useRequestQuotation();
  const openPartSearch = usePartPick((state) => state.open);

  const findInCatalogue = () => {
    openPartSearch((part) => parts.paste(`${part.partNumber} 1`));
    router.push("/part-search");
  };

  const send = () => {
    setError(null);
    request.mutate(
      { branchId, notes: notes.trim() || undefined, items: parts.ready },
      {
        onSuccess: (quotation) => {
          showToast({ message: `Quotation ${quotation.number} requested` });
          router.replace({ pathname: "/quotation/[id]", params: { id: quotation.id } });
        },
        onError: (failure) => setError(errorMessage(failure)),
      },
    );
  };

  return (
    <Screen
      header={<Header title="Request a quotation" subtitle="Quotes hold for 7 days" />}
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={
              parts.ready.length
                ? `Request · ${formatCount(parts.ready.length, "part")}`
                : "Request"
            }
            onPress={send}
            disabled={parts.ready.length === 0}
            loading={request.isPending}
          />
        </BottomBar>
      }
    >
      {error ? <FormAlert message={error} /> : null}
      <SelectField
        label="Deliver to"
        options={(branches.data ?? []).map((branch) => ({ value: branch.id, label: branch.name }))}
        value={branchId}
        onChange={setBranchId}
      />
      <Button
        variant="outline"
        icon={Search}
        label="Find in the catalogue"
        onPress={findInCatalogue}
      />
      <Text tone="muted">Or type the part numbers. Only rows marked OK are sent.</Text>
      <PartNumberRows {...parts} />
      <Input
        label="Note for Kannali (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={1000}
        placeholder="Need these by Friday"
      />
    </Screen>
  );
}
