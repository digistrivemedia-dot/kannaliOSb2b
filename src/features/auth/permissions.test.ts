import { can } from "@/features/auth/permissions";
import { tabsFor } from "@/features/auth/tabs";

describe("can", () => {
  it("lets each role do its own work only", () => {
    expect(can(["owner"], "users:manage")).toBe(true);
    expect(can(["manager"], "users:manage")).toBe(false);
    expect(can(["manager"], "jobs:manage")).toBe(true);
    expect(can(["technician"], "jobs:manage")).toBe(false);
    expect(can(["technician"], "jobs:work")).toBe(true);
    expect(can(["billing"], "jobs:billing")).toBe(true);
    expect(can(["spares"], "orders:place")).toBe(true);
    expect(can(["spares"], "jobs:billing")).toBe(false);
  });

  it("combines several roles", () => {
    expect(can(["technician", "spares"], "orders:place")).toBe(true);
    expect(can(["technician", "spares"], "jobs:work")).toBe(true);
  });

  it("gives nobody anything without a role", () => {
    expect(can([], "jobs:view")).toBe(false);
  });
});

describe("tabsFor", () => {
  it.each([
    [["owner"], ["today", "jobs", "bookings", "shop", "more"]],
    [["manager"], ["today", "jobs", "bookings", "more"]],
    [["technician"], ["my-jobs", "trips", "more"]],
    [["billing"], ["today", "jobs", "more"]],
    [["spares"], ["shop", "orders", "more"]],
  ] as const)("gives %j the tabs %j", (roles, tabs) => {
    expect(tabsFor(roles, "garage").tabs).toEqual(tabs);
  });

  it("combines roles in the fixed order, four tabs and More at most", () => {
    const { tabs, inMore } = tabsFor(["technician", "spares"], "garage");
    expect(tabs).toEqual(["my-jobs", "shop", "orders", "trips", "more"]);
    expect(inMore).toEqual([]);
    const busy = tabsFor(["manager", "spares", "technician"], "garage");
    expect(busy.tabs).toHaveLength(5);
    expect(busy.tabs.at(-1)).toBe("more");
    expect(busy.inMore.length).toBeGreaterThan(0);
  });

  it("shows Jobs instead of My jobs to whoever sees every job", () => {
    expect(tabsFor(["manager", "technician"], "garage").tabs).not.toContain("my-jobs");
  });

  it("gives businesses that aren't garages the buying tabs", () => {
    expect(tabsFor([], "dealer").tabs).toEqual(["home", "shop", "orders", "more"]);
  });
});
