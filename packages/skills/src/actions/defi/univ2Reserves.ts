import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const univ2PairAbi = [
  {
    type: "function",
    name: "getReserves",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "reserve0", type: "uint112" },
      { name: "reserve1", type: "uint112" },
      { name: "blockTimestampLast", type: "uint32" },
    ],
  },
  {
    type: "function",
    name: "token0",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "token1",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export const univ2ReservesSchema = z.object({
  pair: addressSchema.describe("UniswapV2-style pair contract address."),
});

/// SKILL: univ2_reserves — read reserves and token addresses of a UniswapV2 pair.
export const univ2ReservesAction: Action<typeof univ2ReservesSchema> = {
  name: "UNIV2_RESERVES",
  similes: ["uniswap reserves", "pair reserves", "lp reserves", "amm reserves"],
  description: "Read the reserves and token0/token1 addresses of a UniswapV2-style liquidity pair.",
  examples: [
    {
      input: { pair: "0xPair" },
      output: ok("Pair reserves", { reserve0: "1000", reserve1: "2000", token0: "0xa", token1: "0xb" }),
      explanation: "Reads pair reserves and tokens.",
    },
  ],
  schema: univ2ReservesSchema,
  handler: async (agent, input) => {
    try {
      const [reserves, token0, token1] = await Promise.all([
        agent.publicClient.readContract({ address: input.pair, abi: univ2PairAbi, functionName: "getReserves" }),
        agent.publicClient.readContract({ address: input.pair, abi: univ2PairAbi, functionName: "token0" }),
        agent.publicClient.readContract({ address: input.pair, abi: univ2PairAbi, functionName: "token1" }),
      ]);
      const [reserve0, reserve1, blockTimestampLast] = reserves;
      return ok("Pair reserves", {
        pair: input.pair,
        reserve0: reserve0.toString(),
        reserve1: reserve1.toString(),
        blockTimestampLast: blockTimestampLast.toString(),
        token0,
        token1,
      });
    } catch (e) {
      return fail(`univ2_reserves failed: ${errorMessage(e)}`);
    }
  },
};
