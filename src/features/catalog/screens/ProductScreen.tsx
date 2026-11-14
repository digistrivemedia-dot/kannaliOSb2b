import { Image } from "expo-image";
import { router } from "expo-router";
import { PackageX } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";

import { BottomBar } from "@/components/layout/BottomBar";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DetailRow } from "@/components/ui/DetailRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { useCart } from "@/features/cart/store";
import { stockAt } from "@/features/cart/use-cart-lines";
import { useProduct } from "@/features/catalog/queries";
import type { Product } from "@/features/catalog/types";
import { useActiveBranch } from "@/features/company/use-active-branch";
import { formatCount, formatPrice } from "@/lib/format";
import { useSafeParam } from "@/lib/params";
import { colors } from "@/lib/theme";

/** G52: photos, part number, HSN, your price excl. GST against B2C and MRP, stock, fits, quantity, Add to cart. */
export function ProductScreen() {
  const id = useSafeParam("id");
  const query = useProduct(id);
  const product = query.data;
  return product ? (
    <ProductDetail product={product} />
  ) : (
    <Screen header={<Header title="Part" />}>
      {query.isPending && id !== null ? (
        <View accessible accessibilityLabel="Loading" className="gap-4">
          <Skeleton shape="card" className="h-56 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </View>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} what="this part" />
      ) : (
        <EmptyState
          icon={PackageX}
          title="Part not found"
          action={{ label: "Go back", onPress: () => router.back() }}
        />
      )}
    </Screen>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const { width } = useWindowDimensions();
  const activeBranch = useActiveBranch();
  const branchId = useCart((state) => state.branchId) ?? activeBranch.id;
  const add = useCart((state) => state.add);
  const stock = stockAt(product, branchId);
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    add([{ productId: product.id, quantity }]);
    showToast({ message: `${formatCount(quantity, product.unit)} added to the cart` });
  };

  return (
    <Screen
      header={<Header title={product.partNumber} subtitle={product.brand} />}
      bottomBar={
        <BottomBar>
          <View className="flex-row items-center gap-3">
            <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(stock, 1)} />
            <View className="flex-1">
              <Button size="main" label="Add to cart" onPress={addToCart} disabled={stock === 0} />
            </View>
          </View>
          <Button
            variant="ghost"
            label="Go to cart"
            onPress={() => router.push("/cart")}
            fullWidth
          />
        </BottomBar>
      }
    >
      {product.images.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          className="-mx-4"
        >
          {product.images.map((uri, index) => (
            <Image
              key={uri}
              source={{ uri }}
              accessibilityLabel={`${product.name}, photo ${index + 1}`}
              contentFit="contain"
              style={{ width, height: 220, backgroundColor: colors.white }}
            />
          ))}
        </ScrollView>
      )}
      <View className="gap-2">
        <Text variant="title">{product.name}</Text>
        <Text tone="muted">
          {product.partNumber} · {product.brand} · HSN {product.hsnCode}
        </Text>
      </View>
      <Card className="gap-2">
        <Text variant="label" tone="muted" sectionLabel>
          Your price
        </Text>
        <Price paise={product.businessPriceInPaise} gst="excl" size="figure" />
        <Text variant="small" tone="muted">
          Retail price {formatPrice(product.b2cPriceInPaise)} excl. GST · MRP{" "}
          {formatPrice(product.mrpInPaise)} incl. GST · GST {product.gstRatePercent}%
        </Text>
        {stock === 0 ? (
          <StatusBadge word="Out of stock at your branch" tone="danger" />
        ) : (
          <StatusBadge
            word={`${formatCount(stock, product.unit)} in stock at your branch`}
            tone={stock < 10 ? "warning" : "success"}
          />
        )}
      </Card>
      {product.description ? <Text>{product.description}</Text> : null}
      <Section title="Fits">
        <Card className="gap-1">
          {product.compatibleVehicles.length ? (
            product.compatibleVehicles.map((vehicle) => (
              <Text key={vehicle.id}>
                • {vehicle.brand} {vehicle.model}
              </Text>
            ))
          ) : (
            <Text>Universal: fits any vehicle of its kind.</Text>
          )}
        </Card>
      </Section>
      {product.specs.length > 0 && (
        <Section title="Details">
          <Card className="gap-3">
            {product.specs.map((spec) => (
              <DetailRow key={spec.label} label={spec.label}>
                {spec.value}
              </DetailRow>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  );
}
