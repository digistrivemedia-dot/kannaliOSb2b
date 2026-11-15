import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import type { Session } from "@/features/auth/types";
import { useCart } from "@/features/cart/store";
import { CheckoutScreen } from "@/features/checkout/screens/CheckoutScreen";
import { QuickOrderScreen } from "@/features/quick-order/screens/QuickOrderScreen";
import { fakeApi } from "@/test/fake-api";
import creditSummary from "@/test/fixtures/credit-summary.json";
import branches from "@/test/fixtures/dealer-branches.json";
import dealerSession from "@/test/fixtures/dealer-session.json";
import product from "@/test/fixtures/product.json";
import { renderScreen } from "@/test/render";
import { setParams } from "@/test/router";

const dealer = dealerSession as Session;
const RULE = {
  delivery: { b2b: { chargeExclGstInPaise: 25_000, freeFromExclGstInPaise: 500_000 } },
};

function routes(availableInPaise: number) {
  return {
    "POST /catalog/products/lookup": (body: unknown) =>
      (body as { partNumbers: string[] }).partNumbers.includes(product.partNumber) ? [product] : [],
    [`GET /catalog/products/${product.id}`]: product,
    "GET /company/branches": branches,
    "GET /settings/public": RULE,
    "GET /credit/summary": { ...creditSummary, availableInPaise },
    "POST /orders": { id: "ord_new", number: "ORD-2026-0100" },
  };
}

describe("flow: order by part number → checkout on credit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.getState().clear();
    setParams({});
  });

  it("checks part numbers, fills the cart and places the order on credit", async () => {
    const api = fakeApi(routes(2_000_000));

    await renderScreen(<QuickOrderScreen />, { session: dealer });
    await fireEvent.changeText(
      screen.getByLabelText("Part number, row 1"),
      product.partNumber.toLowerCase(),
    );
    const add = await screen.findByRole("button", { name: "Add 1 part to the cart" });
    await fireEvent.press(add);
    expect(router.push).toHaveBeenCalledWith("/cart");
    expect(useCart.getState().items).toEqual([{ productId: product.id, quantity: 1 }]);
    await screen.unmount();

    useCart.getState().setQuantity(product.id, 2);
    await renderScreen(<CheckoutScreen />, { session: dealer });
    await fireEvent.press(await screen.findByRole("radio", { name: /^On credit/ }));
    // 2 × the business price, delivery below the free amount, GST on both: the same as the server.
    const subtotal = product.businessPriceInPaise * 2;
    const gst =
      Math.round((subtotal * product.gstRatePercent) / 100) + Math.round((25_000 * 18) / 100);
    const total = subtotal + 25_000 + gst;
    const place = await screen.findByRole("button", { name: new RegExp(`^Place order`) });
    expect(place.props.accessibilityLabel).toContain(
      `₹${new Intl.NumberFormat("en-IN").format(Math.floor(total / 100))}`,
    );
    await fireEvent.press(place);

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/order-placed/[id]",
        params: { id: "ord_new" },
      }),
    );
    expect(api.posted("/orders")[0]?.body).toEqual({
      branchId: dealer.branchId,
      payment: { method: "credit" },
      items: [{ productId: product.id, quantity: 2 }],
    });
    expect(useCart.getState().items).toEqual([]);
  });

  it("won't put an order on credit beyond what is left", async () => {
    const api = fakeApi(routes(10_000));
    useCart.getState().add([{ productId: product.id, quantity: 2 }]);

    await renderScreen(<CheckoutScreen />, { session: dealer });

    expect(await screen.findByText("Only ₹100 of credit left.", { exact: false })).toBeTruthy();
    const credit = screen.getByRole("radio", { name: /^On credit/ });
    expect(credit.props.accessibilityState).toMatchObject({ disabled: true });
    expect(api.posted("/orders")).toHaveLength(0);
  });
});
