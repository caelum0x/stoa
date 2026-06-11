import { z } from "zod";
import { formatUnits } from "viem";
import { type Action, ok, fail, errorMessage } from "../../types.js";
import { addressSchema } from "../../schemas.js";

const aggregatorV3Abi = [
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export const priceFeedReadSchema = z.object({
  feed: addressSchema.describe("Chainlink-style AggregatorV3 price feed address."),
});

/// SKILL: price_feed_read — read a Chainlink-style AggregatorV3 latest price.
export const priceFeedReadAction: Action<typeof priceFeedReadSchema> = {
  name: "PRICE_FEED_READ",
  similes: ["chainlink price", "oracle price", "read price feed", "latest round data"],
  description: "Read the latest price from a Chainlink-style AggregatorV3 feed, formatted by its decimals.",
  examples: [
    {
      input: { feed: "0xFeed" },
      output: ok("Price feed", { price: "2500.0", updatedAt: "1700000000" }),
      explanation: "Reads latest price and update time.",
    },
  ],
  schema: priceFeedReadSchema,
  handler: async (agent, input) => {
    try {
      const [round, decimals] = await Promise.all([
        agent.publicClient.readContract({ address: input.feed, abi: aggregatorV3Abi, functionName: "latestRoundData" }),
        agent.publicClient.readContract({ address: input.feed, abi: aggregatorV3Abi, functionName: "decimals" }),
      ]);
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = round;
      return ok("Price feed", {
        feed: input.feed,
        roundId: roundId.toString(),
        answer: answer.toString(),
        price: formatUnits(answer, Number(decimals)),
        decimals: Number(decimals),
        startedAt: startedAt.toString(),
        updatedAt: updatedAt.toString(),
        answeredInRound: answeredInRound.toString(),
      });
    } catch (e) {
      return fail(`price_feed_read failed: ${errorMessage(e)}`);
    }
  },
};
