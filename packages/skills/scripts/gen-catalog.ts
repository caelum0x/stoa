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

// Also emit a structured JSON catalog consumed by the web app (apps/web) and other tooling,
// so consumers don't need to import/build @stoa/skills at runtime.
const firstSentence = (s: string): string => {
  const cleaned = s.replace(/\n/g, " ").trim();
  const dot = cleaned.indexOf(". ");
  return dot === -1 ? cleaned : cleaned.slice(0, dot + 1);
};

const catalog = {
  totalSkills: actions.length,
  totalDomains: Object.keys(actionGroups).length,
  domains: Object.entries(actionGroups).map(([domain, acts]) => ({
    domain,
    count: acts.length,
    skills: acts.map((a) => ({ name: a.name, description: firstSentence(a.description) })),
  })),
};

const json = JSON.stringify(catalog, null, 2);
writeFileSync(new URL("../generated/skills.json", import.meta.url), json);
// Mirror into the web app so it has a zero-dependency, static data source.
try {
  writeFileSync(new URL("../../../apps/web/lib/skills-catalog.json", import.meta.url), json);
} catch {
  // apps/web may not exist in all checkouts; ignore.
}

console.log(`Wrote docs/SKILLS.md + generated/skills.json — ${actions.length} skills.`);
