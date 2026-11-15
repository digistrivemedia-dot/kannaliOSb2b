import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import type { Session } from "@/features/auth/types";
import { BookingDetailScreen } from "@/features/bookings/screens/BookingDetailScreen";
import { fakeApi } from "@/test/fake-api";
import booking from "@/test/fixtures/booking.json";
import managerSession from "@/test/fixtures/manager-session.json";
import { renderScreen } from "@/test/render";
import { setParams } from "@/test/router";

const session = managerSession as Session;

describe("flow: accept a booking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Still within its two minutes.
    booking.respondBy = new Date(Date.now() + 90_000).toISOString();
    setParams({ id: booking.id });
  });

  it("accepts and opens the job card made for it", async () => {
    const api = fakeApi({
      [`GET /garage/bookings/${booking.id}`]: booking,
      [`POST /garage/bookings/${booking.id}/accept`]: { id: "jcd_new", number: "JC-2026-0100" },
    });
    await renderScreen(<BookingDetailScreen />, { session });

    await fireEvent.press(await screen.findByRole("button", { name: "Accept" }));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: "/job/[id]",
        params: { id: "jcd_new" },
      }),
    );
    expect(api.posted(`/garage/bookings/${booking.id}/accept`)).toHaveLength(1);
  });

  it("says so when another garage got there first", async () => {
    fakeApi({ [`GET /garage/bookings/${booking.id}`]: booking });
    const answered = jest.fn(async () => ({
      ok: false,
      status: 409,
      text: async () => JSON.stringify({ message: "Already answered", code: "CONFLICT" }),
    }));
    const original = globalThis.fetch;
    globalThis.fetch = jest.fn((input: string | URL | Request, init?: RequestInit) =>
      init?.method === "POST" ? answered() : original(input, init),
    ) as unknown as typeof fetch;
    await renderScreen(<BookingDetailScreen />, { session });

    await fireEvent.press(await screen.findByRole("button", { name: "Accept" }));

    expect(
      await screen.findByText("Too late: this booking was answered or has gone to another garage."),
    ).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
