import { z } from "zod";
import { getCreate2Address, type Hex } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

export const create2AddressSchema = z.object({
  from: addressSchema.describe("Deployer (factory) address."),
  salt: z.string().regex(/^0x[a-fA-F0-9]*$/, "Must be 0x-prefixed hex").describe("32-byte salt as 0x hex."),
  initCodeHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]*$/, "Must be 0x-prefixed hex")
    .describe("keccak-256 hash of the init code, as 0x hex."),
});

/// SKILL: compute_create2_address — predict a CREATE2 contract address.
export const create2AddressAction: Action<typeof create2AddressSchema> = {
  name: "COMPUTE_CREATE2_ADDRESS",
  similes: ["create2 address", "predict create2", "deterministic deploy address", "salted address"],
  description: "Compute the deterministic CREATE2 contract address from a deployer, salt, and init code hash.",
  examples: [
    {
      input: {
        from: "0x0000000000000000000000000000000000000001",
        salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
        initCodeHash: "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
      },
      output: ok("CREATE2 address", { address: "0x..." }),
      explanation: "Predicts a deterministic CREATE2 deployment address.",
    },
  ],
  schema: create2AddressSchema,
  handler: async (_agent, input) => {
    try {
      const address = getCreate2Address({
        from: input.from,
        salt: input.salt as Hex,
        bytecodeHash: input.initCodeHash as Hex,
      });
      return ok("CREATE2 address", { from: input.from, address });
    } catch (e) {
      return fail(`compute_create2_address failed: ${errorMessage(e)}`);
    }
  },
};
