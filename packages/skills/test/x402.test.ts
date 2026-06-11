import { describe, it, expect } from "vitest";
import { parsePaymentRequiredHeader } from "../src/tools/x402.js";

function encode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64");
}

describe("parsePaymentRequiredHeader", () => {
  it("returns null for a null header", () => {
    expect(parsePaymentRequiredHeader(null)).toBeNull();
  });

  it("parses a single-quote payload", () => {
    const header = encode({ price: "0.01", network: "eip155:688689", payTo: "0xabc", asset: "USDC" });
    const quote = parsePaymentRequiredHeader(header);
    expect(quote?.price).toBe("0.01");
    expect(quote?.network).toBe("eip155:688689");
    expect(quote?.payTo).toBe("0xabc");
    expect(quote?.asset).toBe("USDC");
  });

  it("parses an `accepts` array and normalizes maxAmountRequired", () => {
    const header = encode({ accepts: [{ maxAmountRequired: 250, network: "eip155:688689" }] });
    const quote = parsePaymentRequiredHeader(header);
    expect(quote?.price).toBe("250");
    expect(quote?.network).toBe("eip155:688689");
  });

  it("falls back to raw for non-base64 / non-JSON", () => {
    const quote = parsePaymentRequiredHeader("%%%not-base64%%%");
    expect(quote).not.toBeNull();
    // Either decoded-but-unparseable or raw header; price should be undefined.
    expect(quote?.price).toBeUndefined();
  });
});
