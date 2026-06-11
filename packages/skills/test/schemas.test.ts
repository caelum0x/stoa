import { describe, it, expect } from "vitest";
import { addressSchema, decimalAmountSchema, tokenSchema } from "../src/schemas.js";

describe("addressSchema", () => {
  it("accepts a valid address", () => {
    const a = "0x1111111111111111111111111111111111111111";
    expect(addressSchema.parse(a)).toBe(a);
  });
  it("rejects a malformed address", () => {
    expect(() => addressSchema.parse("0x123")).toThrow();
  });
});

describe("decimalAmountSchema", () => {
  it("accepts integers and decimals", () => {
    expect(decimalAmountSchema.parse("1")).toBe("1");
    expect(decimalAmountSchema.parse("1.5")).toBe("1.5");
  });
  it("rejects negatives and junk", () => {
    expect(() => decimalAmountSchema.parse("-1")).toThrow();
    expect(() => decimalAmountSchema.parse("abc")).toThrow();
  });
});

describe("tokenSchema", () => {
  it('accepts "native"', () => {
    expect(tokenSchema.parse("native")).toBe("native");
  });
  it("accepts an address", () => {
    const a = "0x2222222222222222222222222222222222222222";
    expect(tokenSchema.parse(a)).toBe(a);
  });
});
