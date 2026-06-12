"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-blue-600 font-mono">&larr; back</Link>
        <h1 className="text-3xl font-bold mt-4 mb-1">Skill Playground</h1>
        <p className="text-gray-600 mb-8 font-mono text-sm">
          Run read-only Stoa skills live ({skills.length} available — pure + market-data).
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block font-mono text-sm">
              <span className="text-gray-500">skill</span>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 font-mono text-sm bg-white"
              >
                {skills.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} · {s.domain}
                  </option>
                ))}
              </select>
            </label>
            {current && <p className="text-xs text-gray-500 font-mono">{current.description}</p>}

            <label className="block font-mono text-sm">
              <span className="text-gray-500">input (JSON)</span>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 font-mono text-sm bg-white"
              />
            </label>

            <button
              onClick={run}
              disabled={busy || !selected}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-mono transition-colors"
            >
              {busy ? "Running…" : "Run skill"}
            </button>
          </div>

          <div>
            <span className="text-gray-500 font-mono text-sm">result</span>
            <pre className="mt-1 bg-gray-900 text-green-300 rounded-lg p-4 text-xs overflow-auto h-[22rem] font-mono">
              {result || "// run a skill to see its output"}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
