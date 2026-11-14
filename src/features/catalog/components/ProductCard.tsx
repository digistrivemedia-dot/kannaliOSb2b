import { Image } from "expo-image";
import { router } from "expo-router";
import { Package } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/Text";
import { stockAt } from "@/features/cart/use-cart-lines";
import type { Product } from "@/features/catalog/types";
import { formatCount, formatPrice } from "@/lib/format";
import { colors, radius } from "@/lib/theme";

/** A part in a list: name, part number, your price excl. GST and stock at the delivery branch. */
export function ProductCard({ product, branchId }: { product: Product; branchId: string }) {
  const stock = stockAt(product, branchId);
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.partNumber}, ${formatPrice(product.businessPriceInPaise)} excl. GST`}
      className="flex-row gap-3 rounded-card border border-gray-200 bg-white p-3 active:bg-gray-50"
    >
      {product.images[0] ? (
        <Image
          source={{ uri: product.images[0] }}
          contentFit="cover"
          style={thumb}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={thumb} className="items-center justify-center">
          <Package size={28} color={colors.gray[500]} />
        </View>
      )}
      <View className="flex-1 gap-1">
        <Text weight="semibold" numberOfLines={2}>
          {product.name}
        </Text>
        <Text variant="small" tone="muted">
          {product.partNumber} · {product.brand}
        </Text>
        <View className="flex-row items-baseline gap-1.5">
          <Text weight="semibold" tabular>
            {formatPrice(product.businessPriceInPaise)}
          </Text>
          <Text variant="label" tone="muted">
            excl. GST
          </Text>
        </View>
        {stock === 0 ? (
          <StatusBadge word="Out of stock" tone="danger" />
        ) : stock < 10 ? (
          <StatusBadge word={`Only ${formatCount(stock, product.unit)}`} tone="warning" />
        ) : (
          <StatusBadge word="In stock" tone="success" />
        )}
      </View>
    </Pressable>
  );
}

const thumb = {
  width: 80,
  height: 80,
  borderRadius: radius.input,
  backgroundColor: colors.gray[100],
};
