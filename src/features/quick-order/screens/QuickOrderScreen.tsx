import { router } from "expo-router";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useCart } from "@/features/cart/store";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { PartNumberRows } from "@/features/quick-order/components/PartNumberRows";
import { usePartRows } from "@/features/quick-order/use-part-rows";
import { formatCount } from "@/lib/format";

/** G53: type or paste part numbers with quantities; each row is checked; add every OK row to the cart. */
export function QuickOrderScreen() {
  const activeBranch = useActiveBranch();
  const branchId = useCart((state) => state.branchId) ?? activeBranch.id;
  const add = useCart((state) => state.add);
  const parts = usePartRows({ branchId, checkStock: true });

  const addAll = () => {
    add(parts.ready);
    showToast({ message: `${formatCount(parts.ready.length, "part")} added to the cart` });
    parts.reset();
    router.push("/cart");
  };

  return (
    <Screen
      header={
        <Header title="Order by part number" subtitle="Checked against stock at your branch" />
      }
      bottomBar={
        <BottomBar>
          <Button
            size="main"
            label={
              parts.ready.length
                ? `Add ${formatCount(parts.ready.length, "part")} to the cart`
                : "Add OK rows to the cart"
            }
            onPress={addAll}
            disabled={parts.ready.length === 0}
          />
        </BottomBar>
      }
    >
      <Text tone="muted">Only rows marked OK are added. Fix or remove the others.</Text>
      <PartNumberRows {...parts} />
    </Screen>
  );
}
