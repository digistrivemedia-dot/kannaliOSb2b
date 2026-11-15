import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import { SignInScreen } from "@/features/auth/screens/SignInScreen";
import { useAuth } from "@/features/auth/store";
import { tabsFor } from "@/features/auth/tabs";
import type { Session } from "@/features/auth/types";
import { TodayScreen } from "@/features/dashboard/screens/TodayScreen";
import { fakeApi } from "@/test/fake-api";
import booking from "@/test/fixtures/booking.json";
import managerSession from "@/test/fixtures/manager-session.json";
import { renderScreen } from "@/test/render";

const session = managerSession as Session;

describe("flow: sign in → Today", () => {
  it("signs a manager in and opens Today with what needs them", async () => {
    // A new booking still inside its two minutes.
    const fresh = { ...booking, respondBy: new Date(Date.now() + 90_000).toISOString() };
    const api = fakeApi({
      "POST /auth/sign-in": {
        status: "signed_in",
        sessionToken: "token-1",
        approvalStatus: "approved",
        mustSetPassword: false,
      },
      "GET /auth/session": session,
      "GET /garage/bookings": (_body, query) =>
        query.get("status") === "new"
          ? { items: [fresh], page: 1, pageSize: 20, total: 1 }
          : { items: [], page: 1, pageSize: 20, total: 0 },
      "GET /garage/jobs": { items: [], page: 1, pageSize: 1, total: 3 },
    });

    await renderScreen(<SignInScreen />);
    await fireEvent.changeText(screen.getByLabelText("Business email"), session.user.email);
    await fireEvent.changeText(screen.getByLabelText("Password"), "Demo@1234");
    await fireEvent.press(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(useAuth.getState().status).toBe("signed_in"));
    expect(api.posted("/auth/sign-in")[0]?.body).toEqual({
      email: session.user.email,
      password: "Demo@1234",
    });
    // The root layout then shows the tabs; a manager's first tab is Today.
    expect(tabsFor(session.roles, session.business.type).tabs[0]).toBe("today");

    await screen.unmount();
    await renderScreen(<TodayScreen />, { session });
    expect(await screen.findByText("Needs you now")).toBeTruthy();
    expect(
      await screen.findByRole("button", {
        name: new RegExp(`^New booking: ${booking.vehicle.plate}`),
      }),
    ).toBeTruthy();
    expect(await screen.findAllByRole("button", { name: /: 3$/ })).not.toHaveLength(0);
  });

  it("shows the API's message on a wrong password", async () => {
    fakeApi({});
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 401,
      text: async () =>
        JSON.stringify({
          message: "That email and password don't match.",
          code: "INVALID_CREDENTIALS",
        }),
    })) as unknown as typeof fetch;

    await renderScreen(<SignInScreen />);
    await fireEvent.changeText(
      screen.getByLabelText("Business email"),
      "ravi@srisaiworks.example.com",
    );
    await fireEvent.changeText(screen.getByLabelText("Password"), "wrong-password");
    await fireEvent.press(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("That email and password don't match.")).toBeTruthy();
  });
});
