import { formatPlate, isValidPlate } from "@/lib/format";

describe("plates", () => {
  it("formats as typed", () => {
    expect(formatPlate("ka01ab1234")).toBe("KA 01 AB 1234");
    expect(formatPlate("ka-01 ab 1234")).toBe("KA 01 AB 1234");
    expect(formatPlate("ka0")).toBe("KA 0");
    expect(formatPlate("22bh1234aa")).toBe("22 BH 1234 AA");
  });

  it("knows a real plate", () => {
    expect(isValidPlate("KA 01 AB 1234")).toBe(true);
    expect(isValidPlate("ka01ab1234")).toBe(true);
    expect(isValidPlate("22 BH 1234 AA")).toBe(true);
    expect(isValidPlate("KA 01")).toBe(false);
    expect(isValidPlate("1234")).toBe(false);
  });
});
