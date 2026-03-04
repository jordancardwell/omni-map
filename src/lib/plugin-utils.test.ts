import { describe, it, expect } from "vitest";
import { getFieldValue, formatCompactNumber, buildGroupColorMap } from "./plugin-utils";

describe("getFieldValue", () => {
  it("accesses top-level fields", () => {
    expect(getFieldValue({ name: "English" }, "name")).toBe("English");
  });

  it("accesses nested fields with dot notation", () => {
    const item = { speakers: { total: 1500000000 } };
    expect(getFieldValue(item, "speakers.total")).toBe(1500000000);
  });

  it("returns undefined for missing paths", () => {
    expect(getFieldValue({ name: "English" }, "missing.path")).toBeUndefined();
  });

  it("returns undefined for null intermediate", () => {
    expect(getFieldValue({ a: null }, "a.b")).toBeUndefined();
  });
});

describe("formatCompactNumber", () => {
  it("formats billions", () => {
    expect(formatCompactNumber(1500000000)).toBe("1.5B");
  });

  it("formats millions", () => {
    expect(formatCompactNumber(920000000)).toBe("920M");
  });

  it("formats thousands", () => {
    expect(formatCompactNumber(25000)).toBe("25K");
  });

  it("returns small numbers as-is", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });
});

describe("buildGroupColorMap", () => {
  it("assigns colors from palette to sorted groups", () => {
    const palette = ["#red", "#blue", "#green"];
    const map = buildGroupColorMap(["B", "A", "C"], palette);
    expect(map["A"]).toBe("#red");
    expect(map["B"]).toBe("#blue");
    expect(map["C"]).toBe("#green");
  });

  it("cycles palette for more groups than colors", () => {
    const palette = ["#a", "#b"];
    const map = buildGroupColorMap(["X", "Y", "Z"], palette);
    expect(map["Z"]).toBe("#a"); // wraps around
  });
});
