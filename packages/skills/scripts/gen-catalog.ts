/**
 * Generate docs/SKILLS.md from the live skill registry.
 * Run: pnpm --filter @stoa/skills exec tsx scripts/gen-catalog.ts
 */
import { writeFileSync } from "node:fs";
import { actionGroups, actions } from "../src/index.js";

const lines: string[] = [];
lines.push("# Stoa Skill Catalog");
lines.push("");
lines.push(`> Auto-generated from the skill registry. **${actions.length} skills** across ` +
  `${Object.keys(actionGroups).length} domains.`);
lines.push("");

for (const [group, acts] of Object.entries(actionGroups)) {
  lines.push(`## ${group} (${acts.length})`);
  lines.push("");
  lines.push("| Skill | Description |");
  lines.push("|-------|-------------|");
  for (const a of acts) {
    const desc = a.description.replace(/\n/g, " ").replace(/\|/g, "\\|");
    lines.push(`| \`${a.name}\` | ${desc} |`);
  }
  lines.push("");
}

writeFileSync(new URL("../../../docs/SKILLS.md", import.meta.url), lines.join("\n"));
console.log(`Wrote docs/SKILLS.md — ${actions.length} skills.`);
