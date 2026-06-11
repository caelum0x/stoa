/// Parse CLI input into a skill-input object.
///
/// Accepts either a single JSON blob:   stoa X402_PAY '{"url":"https://..."}'
/// or whitespace-separated key=value pairs: stoa erc20_balance token=0xabc account=0xdef
/// Values in key=value form are JSON-parsed when possible (numbers, booleans, arrays, objects),
/// otherwise kept as strings.
export function parseInput(parts: string[]): Record<string, unknown> {
  if (parts.length === 0) return {};

  const joined = parts.join(" ").trim();
  if (joined.startsWith("{")) {
    return JSON.parse(joined) as Record<string, unknown>;
  }

  const out: Record<string, unknown> = {};
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    const raw = part.slice(eq + 1);
    out[key] = coerce(raw);
  }
  return out;
}

function coerce(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+$/.test(raw) && raw.length < 16) return Number(raw);
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}
