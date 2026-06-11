import { z } from "zod";
import { type Action, ok, fail, errorMessage } from "../../types.js";

export const buildAuthMessageSchema = z.object({
  domain: z.string().min(1).describe("Domain requesting the sign-in, e.g. \"app.example.com\"."),
  uri: z.string().min(1).describe("URI the signature is scoped to, e.g. \"https://app.example.com/login\"."),
  nonce: z.string().min(1).describe("Random nonce to prevent replay attacks."),
  statement: z.string().optional().describe("Optional human-readable statement shown to the signer."),
});

/// SKILL: build_auth_message — compose a SIWE-like plaintext auth message for the agent.
export const buildAuthMessageAction: Action<typeof buildAuthMessageSchema> = {
  name: "BUILD_AUTH_MESSAGE",
  similes: ["siwe message", "sign in with ethereum", "build auth message", "compose login message"],
  description: "Build a Sign-In With Ethereum style plaintext message for the agent's address on Pharos.",
  examples: [
    {
      input: { domain: "app.example.com", uri: "https://app.example.com/login", nonce: "abc123" },
      output: ok("Auth message built", { message: "app.example.com wants you to sign in..." }),
      explanation: "Builds a SIWE-like message for the agent to sign.",
    },
  ],
  schema: buildAuthMessageSchema,
  handler: async (agent, input) => {
    try {
      const issuedAt = new Date().toISOString();
      const lines = [
        `${input.domain} wants you to sign in with your Ethereum account:`,
        agent.address,
        "",
      ];
      if (input.statement) {
        lines.push(input.statement, "");
      }
      lines.push(
        `URI: ${input.uri}`,
        "Version: 1",
        `Chain ID: ${agent.chain.id}`,
        `Nonce: ${input.nonce}`,
        `Issued At: ${issuedAt}`,
      );
      const message = lines.join("\n");
      return ok("Auth message built", {
        message,
        address: agent.address,
        chainId: agent.chain.id.toString(),
        domain: input.domain,
        uri: input.uri,
        nonce: input.nonce,
        issuedAt,
      });
    } catch (e) {
      return fail(`build_auth_message failed: ${errorMessage(e)}`);
    }
  },
};
