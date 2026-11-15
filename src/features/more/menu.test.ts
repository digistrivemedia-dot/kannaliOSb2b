import type { Role, Session } from "@/features/auth/types";
import { tabsFor } from "@/features/auth/tabs";
import type { BusinessType } from "@/features/company/types";
import { moreMenu } from "@/features/more/menu";
import managerSession from "@/test/fixtures/manager-session.json";

/** The demo logins, with the roles the seeded backend gives them (checked by signing in as each). */
const DEMO_LOGINS: { login: string; roles: Role[]; type: BusinessType; credit: boolean }[] = [
  { login: "mahesh (owner)", roles: ["owner"], type: "garage", credit: false },
  { login: "ravi (manager)", roles: ["manager"], type: "garage", credit: false },
  {
    login: "venkatesh (technician, spares)",
    roles: ["technician", "spares"],
    type: "garage",
    credit: false,
  },
  { login: "imran (technician)", roles: ["technician"], type: "garage", credit: false },
  { login: "shilpa (billing)", roles: ["billing"], type: "garage", credit: false },
  { login: "ganesh (dealer, credit)", roles: ["owner"], type: "dealer", credit: true },
  { login: "raghavendra (fleet, credit)", roles: ["owner"], type: "fleet", credit: true },
  { login: "lakshmi (retailer, no credit)", roles: ["owner"], type: "retailer", credit: false },
];

function sessionFor({ roles, type, credit }: (typeof DEMO_LOGINS)[number]): Session {
  const base = managerSession as Session;
  return { ...base, roles, business: { ...base.business, type, creditEnabled: credit } };
}

describe("what each demo login sees", () => {
  const seen = Object.fromEntries(
    DEMO_LOGINS.map((demo) => {
      const session = sessionFor(demo);
      const { tabs } = tabsFor(demo.roles, demo.type);
      const more = moreMenu(session, tabs).map(
        (group) => `${group.title}: ${group.items.map((item) => item.label).join(", ")}`,
      );
      return [demo.login, { tabs: tabs.join(" · "), more }];
    }),
  );

  it("matches CLAUDE.md §3", () => {
    expect(seen).toMatchInlineSnapshot(`
     {
       "ganesh (dealer, credit)": {
         "more": [
           "Buying: Order by part number, Quotations, Returns",
           "Money: Credit, Payments, Documents",
           "Company: Business profile, Addresses",
         ],
         "tabs": "home · shop · orders · more",
       },
       "imran (technician)": {
         "more": [],
         "tabs": "my-jobs · trips · more",
       },
       "lakshmi (retailer, no credit)": {
         "more": [
           "Buying: Order by part number, Quotations, Returns",
           "Money: Payments, Documents",
           "Company: Business profile, Addresses",
         ],
         "tabs": "home · shop · orders · more",
       },
       "mahesh (owner)": {
         "more": [
           "Garage: Trips, Customers, Reviews, Reports, Branches, Garage profile",
           "Buying: Order by part number, Orders, Quotations, Returns",
           "Money: Payments, Documents",
           "Company: Business profile, Addresses, Team",
         ],
         "tabs": "today · jobs · bookings · shop · more",
       },
       "raghavendra (fleet, credit)": {
         "more": [
           "Buying: Order by part number, Quotations, Returns",
           "Money: Credit, Payments, Documents",
           "Company: Business profile, Addresses",
         ],
         "tabs": "home · shop · orders · more",
       },
       "ravi (manager)": {
         "more": [
           "Garage: Trips, Customers, Reviews",
         ],
         "tabs": "today · jobs · bookings · more",
       },
       "shilpa (billing)": {
         "more": [
           "Garage: Trips, Customers",
         ],
         "tabs": "today · jobs · more",
       },
       "venkatesh (technician, spares)": {
         "more": [
           "Garage: Jobs",
           "Buying: Order by part number, Quotations, Returns",
         ],
         "tabs": "my-jobs · shop · orders · trips · more",
       },
     }
    `);
  });
});
