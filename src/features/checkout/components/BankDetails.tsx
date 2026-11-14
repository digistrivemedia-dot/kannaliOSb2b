import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { KANNALI_BANK_ACCOUNT } from "@/features/checkout/bank-account";

const ROWS = [
  { label: "Account name", value: KANNALI_BANK_ACCOUNT.accountName },
  { label: "Bank", value: KANNALI_BANK_ACCOUNT.bank },
  { label: "Account number", value: KANNALI_BANK_ACCOUNT.accountNumber },
  { label: "IFSC", value: KANNALI_BANK_ACCOUNT.ifsc },
];

/** Where to send a bank transfer; the numbers can be long-pressed to copy. */
export function BankDetails() {
  return (
    <View className="gap-2 rounded-input bg-gray-50 p-3">
      {ROWS.map((row) => (
        <View key={row.label} className="flex-row justify-between gap-3">
          <Text variant="small" tone="muted">
            {row.label}
          </Text>
          <Text variant="small" weight="semibold" selectable tabular className="flex-1 text-right">
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
