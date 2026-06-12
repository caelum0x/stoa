"use client";
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Button, SectionHeading } from "@/components/ui";

interface RunnableSkill {
  name: string;
  domain: string;
  description: string;
}

// A few helpful starter inputs so the playground works on first click.
const PRESETS: Record<string, string> = {
  KECCAK256: '{ "data": "hello" }',
  MATH_ADD: '{ "a": "1000000000000000000", "b": "500000000000000000" }',
  FORMAT_SHORT_ADDRESS: '{ "address": "0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8" }',
  DEFILLAMA_PROTOCOL_TVL: '{ "protocol": "aave" }',
  DEXSCREENER_SEARCH: '{ "query": "USDC" }',
  IS_ADDRESS: '{ "value": "0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8" }',
};

export default function PlaygroundPage() {
  const [skills, setSkills] = useState<RunnableSkill[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [input, setInput] = useState<string>("{}");
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/run")
      .then((r) => r.json())
      .then((d) => {
        setSkills(d.skills ?? []);
        if (d.skills?.[0]) setSelected(d.skills[0].name);
      })
      .catch(() => setSkills([]));
  }, []);

  const current = useMemo(() => skills.find((s) => s.name === selected), [skills, selected]);

  useEffect(() => {
    if (selected && PRESETS[selected]) setInput(PRESETS[selected]);
  }, [selected]);

  async function run() {
    setBusy(true);
    setResult("");
    try {
      const body = JSON.parse(input || "{}");
      const res = await fetch(`/api/run/${selected}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setResult(JSON.stringify(await res.json(), null, 2));
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-12">
      <SectionHeading
        title="Skill playground"
        subtitle={`Run read-only skills live · ${skills.length} available (pure + market-data)`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-4 p-6">
          <label className="block font-mono text-sm">
            <span className="text-zinc-500">skill</span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-violet-400/50"
            >
              {skills.map((s) => (
                <option key={s.name} value={s.name} className="bg-zinc-900">
                  {s.name} · {s.domain}
                </option>
              ))}
            </select>
          </label>
          {current && <p className="font-mono text-xs text-zinc-500">{current.description}</p>}

          <label className="block font-mono text-sm">
            <span className="text-zinc-500">input (JSON)</span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-violet-400/50"
            />
          </label>

          <Button onClick={run} disabled={busy || !selected} className="w-full">
            {busy ? "Running…" : "Run skill"}
          </Button>
        </Card>

        <div>
          <span className="font-mono text-sm text-zinc-500">result</span>
          <pre className="scroll-thin mt-1 h-[22rem] overflow-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-emerald-300">
            {result || "// run a skill to see its output"}
          </pre>
        </div>
      </div>
    </Container>
  );
}
