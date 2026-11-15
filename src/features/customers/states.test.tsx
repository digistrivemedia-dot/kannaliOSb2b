import { fireEvent, screen } from "@testing-library/react-native";

import type { Session } from "@/features/auth/types";
import { CustomersScreen } from "@/features/customers/screens/CustomersScreen";
import { fakeApi } from "@/test/fake-api";
import managerSession from "@/test/fixtures/manager-session.json";
import { renderScreen } from "@/test/render";

const session = managerSession as Session;
const CUSTOMER = {
  id: "cus_1",
  name: "Meena Iyer",
  phone: "+919845012345",
  hasAppAccount: true,
  createdAt: "2026-11-01T10:00:00Z",
  vehicles: [
    {
      id: "veh_1",
      plate: "KA01AB1234",
      type: "scooter",
      make: "Honda",
      model: "Activa 6G",
      customerId: "cus_1",
    },
  ],
  lastVisitAt: "2026-11-10T10:00:00Z",
  jobCount: 2,
};

describe("a data area's four states (Customers)", () => {
  it("goes from loading to offline, to empty after Try again, to content", async () => {
    // No connection first.
    const offline = jest.fn(async () => {
      throw new TypeError("Network request failed");
    });
    globalThis.fetch = offline as unknown as typeof fetch;
    await renderScreen(<CustomersScreen />, { session });
    expect(screen.getByLabelText("Loading")).toBeTruthy();
    expect(await screen.findByText("No connection")).toBeTruthy();

    // Back online, nobody on record yet.
    fakeApi({});
    await fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("No customers yet")).toBeTruthy();
    expect(
      screen.getByText("Customers are added with their first walk-in or booking."),
    ).toBeTruthy();

    // A search that finds someone shows them.
    fakeApi({
      "GET /garage/customers": (_body, query) =>
        query.get("q")
          ? { items: [CUSTOMER], page: 1, pageSize: 20, total: 1 }
          : { items: [], page: 1, pageSize: 20, total: 0 },
    });
    await fireEvent.changeText(screen.getByLabelText("Name, phone or plate"), "Meena");
    expect(await screen.findByText("Meena Iyer")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Call Meena Iyer" })).toBeTruthy();
  });
});
