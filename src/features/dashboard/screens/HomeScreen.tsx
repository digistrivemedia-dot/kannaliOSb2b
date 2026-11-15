import { router } from "expo-router";
import { CircleAlert, FilePlus2, FileText, ListOrdered, ShoppingBag } from "lucide-react-native";

import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListRow } from "@/components/ui/ListRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { useSession } from "@/features/auth/store";
import { useCan } from "@/features/auth/use-can";
import { useCreditSummary } from "@/features/credit/queries";
import { greeting } from "@/features/dashboard/utils";
import { RecentOrders } from "@/features/orders/components/RecentOrders";
import { useRefetchOrders } from "@/features/orders/queries";
import { useQuotations } from "@/features/quotations/queries";
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
  const refetchOrders = useRefetchOrders();
  const overdue = credit.data && credit.data.overdueInvoiceCount > 0 ? credit.data : null;
  const toAnswer = quoted.data?.total ?? 0;

  return (
    <Screen
      inTabs
      header={<TopBar title={greeting(user.name, new Date())} subtitle={business.name} />}
      onRefresh={() => Promise.all([quoted.refetch(), refetchOrders(), credit.refetch()])}
    >
      <Section title="Needs you now">
        {quoted.isPending || (credit.isPending && credit.fetchStatus !== "idle") ? (
          <Skeleton shape="card" className="h-20 w-full" />
        ) : quoted.isError || credit.isError ? (
          <ErrorState
            error={quoted.error ?? credit.error}
            onRetry={() => void Promise.all([quoted.refetch(), credit.refetch()])}
            what="what needs you"
          />
        ) : overdue || toAnswer ? (
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
      <RecentOrders />
    </Screen>
  );
}
