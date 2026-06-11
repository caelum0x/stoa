#!/usr/bin/env node
import { StoaAgent, actions, actionsByName, actionGroups } from "@stoa/skills";
import { parseInput } from "./args.js";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
};

function printHelp(): void {
  console.log(`${C.bold}${C.cyan}Stoa CLI${C.reset} — run any Stoa skill on Pharos.

${C.bold}Usage${C.reset}
  stoa <SKILL> [key=value ...]        run a skill with key=value args
  stoa <SKILL> '{"json":"input"}'     run a skill with a JSON input
  stoa list                            list every skill, grouped by domain
  stoa list <group>                    list skills in one domain
  stoa describe <SKILL>                show a skill's schema + examples
  stoa help                            this help

${C.bold}Environment${C.reset}
  STOA_PRIVATE_KEY   agent signer (testnet)        [required for on-chain skills]
  PHAROS_RPC_URL     RPC (defaults to Atlantic)
  STOA_REGISTRY_ADDRESS / STOA_ESCROW_ADDRESS / STOA_SERVICES_ADDRESS / ...

${C.bold}Examples${C.reset}
  stoa GET_CHAIN_INFO
  stoa GET_NATIVE_BALANCE address=0xabc...
  stoa ERC20_BALANCE token=0xUSDC
  stoa X402_PAY '{"url":"https://api.example.com/data","maxPrice":"0.05"}'

${C.dim}${actions.length} skills available. Run "stoa list" to see them all.${C.reset}`);
}

function listSkills(group?: string): void {
  const groups = Object.entries(actionGroups) as Array<[string, typeof actions]>;
  for (const [name, acts] of groups) {
    if (group && group !== name) continue;
    console.log(`\n${C.bold}${C.cyan}${name}${C.reset} ${C.dim}(${acts.length})${C.reset}`);
    for (const a of acts) {
      console.log(`  ${C.green}${a.name}${C.reset} — ${a.description.split(".")[0]}`);
    }
  }
}

function describe(name: string): void {
  const action = actionsByName[name.toUpperCase()];
  if (!action) {
    console.error(`${C.red}Unknown skill: ${name}${C.reset}`);
    process.exit(1);
  }
  console.log(`${C.bold}${C.green}${action.name}${C.reset}\n${action.description}\n`);
  console.log(`${C.bold}Aliases:${C.reset} ${action.similes.join(", ")}`);
  console.log(`\n${C.bold}Examples:${C.reset}`);
  for (const ex of action.examples) {
    console.log(`  input:  ${JSON.stringify(ex.input)}`);
    console.log(`  ${C.dim}${ex.explanation}${C.reset}`);
  }
}

async function run(name: string, rest: string[]): Promise<void> {
  const action = actionsByName[name.toUpperCase()];
  if (!action) {
    console.error(`${C.red}Unknown skill: ${name}${C.reset}  (try "stoa list")`);
    process.exit(1);
  }

  const rawInput = parseInput(rest);
  const parsed = action.schema.safeParse(rawInput);
  if (!parsed.success) {
    console.error(`${C.red}Invalid input for ${action.name}:${C.reset}`);
    console.error(parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n"));
    process.exit(1);
  }

  const agent = StoaAgent.fromEnv();
  const result = await action.handler(agent, parsed.data);
  const color = result.status === "success" ? C.green : C.red;
  console.log(`${color}${result.status.toUpperCase()}${C.reset} ${result.message}`);
  if (result.data !== undefined) {
    console.log(JSON.stringify(result.data, null, 2));
  }
  process.exit(result.status === "success" ? 0 : 1);
}

async function main(): Promise<void> {
  const [cmd, ...rest] = process.argv.slice(2);

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") return printHelp();
  if (cmd === "list") return listSkills(rest[0]);
  if (cmd === "describe") {
    if (!rest[0]) {
      console.error("Usage: stoa describe <SKILL>");
      process.exit(1);
    }
    return describe(rest[0]);
  }
  await run(cmd, rest);
}

main().catch((err) => {
  console.error(`${C.red}Error:${C.reset} ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
