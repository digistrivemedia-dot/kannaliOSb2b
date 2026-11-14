import { router } from "expo-router";
import { CircleAlert, FilePlus2, FileText, ListOrdered, ShoppingBag } from "lucide-react-native";
import { View } from "react-native";

import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Text } from "@/components/ui/Text";
import { useSession } from "@/features/auth/store";
import { useCan } from "@/features/auth/use-can";
import { useCreditSummary } from "@/features/credit/queries";
import { OrderCard } from "@/features/orders/components/OrderCard";
import { useOrders } from "@/features/orders/queries";
import { useReorder } from "@/features/orders/use-reorder";
import { useQuotations } from "@/features/quotations/queries";
import { greeting } from "@/features/dashboard/utils";
import { formatCount, formatPrice } from "@/lib/format";

/**
 * Home for businesses that aren't garages (G-Q07: the website's buying dashboard, B07): what needs
 * them now (quotations to answer, overdue credit), recent orders with Reorder, and quick links.
 */
export function HomeScreen() {
  const { user, business } = useSession();
  const canSeeCredit = useCan("credit:view");
  const quoted = useQuotations({ status: "quoted", pageSize: 5 });
  const credit = useCreditSummary({ enabled: business.creditEnabled && canSeeCredit });
  const recent = useOrders({ sort: "placedAt", order: "desc", pageSize: 3 });
  const { reorder, reorderingId } = useReorder();
  const overdue = credit.data && credit.data.overdueInvoiceCount > 0 ? credit.data : null;
  const toAnswer = quoted.data?.total ?? 0;

  return (
    <Screen
      inTabs
      header={<TopBar title={greeting(user.name, new Date())} subtitle={business.name} />}
      onRefresh={() => Promise.all([quoted.refetch(), recent.refetch(), credit.refetch()])}
    >
      <Section title="Needs you now">
        {overdue || toAnswer ? (
          <Card flush>
            {overdue ? (
              <ListRow
                icon={CircleAlert}
                destructive
                title={`${formatCount(overdue.overdueInvoiceCount, "invoice")} overdue`}
                subtitle={`${formatPrice(overdue.overdueInPaise)} to pay`}
                onPress={() => router.push("/credit")}
              />
            ) : null}
            {toAnswer ? (
              <ListRow
                icon={FileText}
                title={`${formatCount(toAnswer, "quotation")} waiting for your answer`}
                subtitle="Quoted prices hold for 7 days"
                onPress={() => router.push("/quotations")}
                divided={Boolean(overdue)}
              />
            ) : null}
          </Card>
        ) : (
          <Card>
            <Text tone="muted">Nothing needs you right now.</Text>
          </Card>
        )}
      </Section>
      <Card flush>
        <ListRow
          icon={ShoppingBag}
          title="Shop"
          subtitle="Your business prices"
          onPress={() => router.push("/shop")}
        />
        <ListRow
          icon={ListOrdered}
          title="Order by part number"
          onPress={() => router.push("/quick-order")}
          divided
        />
        <ListRow
          icon={FilePlus2}
          title="Request a quotation"
          onPress={() => router.push("/quotation/new")}
          divided
        />
      </Card>
      <Section
        title="Recent orders"
        action={{ label: "All orders", onPress: () => router.push("/orders") }}
      >
        {recent.data?.items.length ? (
          <View className="gap-3">
            {recent.data.items.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReorder={() => void reorder(order.id)}
                isReordering={reorderingId === order.id}
              />
            ))}
          </View>
        ) : (
          <Text tone="muted">
            {recent.isPending ? "Loading…" : "Your orders show here, ready to order again."}
          </Text>
        )}
      </Section>
    </Screen>
  );
}
