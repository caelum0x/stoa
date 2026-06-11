// @stoa/sdk — x402 seller-side helper.
//
// Re-exports the monetized server factory from @stoa/skills so SDK consumers can
// stand up an x402-protected endpoint without reaching into the skills package.

export { createMonetizedServer } from "@stoa/skills";
