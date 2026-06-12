import "server-only";
import catalogJson from "./skills-catalog.json";

// Domains whose skills are safe to run in the public playground: pure/computational helpers and
// read-only market-data lookups. They need no private key and move no funds. Write skills,
// key-generation, and on-chain mutations are intentionally excluded.
const SAFE_DOMAINS = new Set<string>([
  "utils",
  "math",
  "format",
  "convert",
  "bytes",
  "encoding",
  "hashing",
  "abitools",
  "base64",
  "duration",
  "pricemath",
  "amm",
  "units",
  "validate",
  "marketdata",
  "chainreg",
  "memo",
  "addressutils",
  "sigutils",
  "agentcard",
  "time",
]);

interface CatalogJson {
  domains: Array<{ domain: string; skills: Array<{ name: string; description: string }> }>;
}

const CATALOG = catalogJson as CatalogJson;

export interface RunnableSkill {
  name: string;
  domain: string;
  description: string;
}

/// Every skill that can be executed in the playground (no keys, no writes).
export function getRunnableSkills(): RunnableSkill[] {
  const out: RunnableSkill[] = [];
  for (const d of CATALOG.domains ?? []) {
    if (!SAFE_DOMAINS.has(d.domain)) continue;
    for (const s of d.skills ?? []) {
      out.push({ name: s.name, domain: d.domain, description: s.description });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

const RUNNABLE = new Set(getRunnableSkills().map((s) => s.name));

export function isRunnable(name: string): boolean {
  return RUNNABLE.has(name.toUpperCase());
}
