import Link from "next/link";
import { getCommerceSkills, getSkillCount, PHAROS } from "@/lib/stoa";

export default function Home() {
  const commerceSkills = getCommerceSkills();
  const skillCount = getSkillCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 flex flex-col">
      <div className="flex-grow">
        {/* Nav */}
        <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <span className="font-mono font-bold text-lg">stoa</span>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            <Link href="/marketplace" className="hover:text-blue-600 transition-colors">
              marketplace
            </Link>
            <Link href="/agents" className="hover:text-blue-600 transition-colors">
              agents
            </Link>
            <Link href="/skills" className="hover:text-blue-600 transition-colors">
              skills
            </Link>
            <Link href="/playground" className="hover:text-blue-600 transition-colors">
              playground
            </Link>
            <Link href="/protected" className="hover:text-blue-600 transition-colors">
              protected
            </Link>
            <Link href="/connect" className="hover:text-blue-600 transition-colors">
              connect
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
              Stoa — The Agent Commerce Stack for Pharos
            </h1>
            <p className="text-xl text-gray-600 mb-4 font-mono">
              discover → trust → hire → pay → settle → rate
            </p>
            <p className="text-base text-gray-500 mb-8 max-w-2xl mx-auto">
              Composable skills that let any Pharos agent get paid, pay other agents, prove who it
              is, and settle work through on-chain escrow — {skillCount} skills on chain{" "}
              <span className="font-mono">{PHAROS.chainId}</span>.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/marketplace"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-mono transition-colors text-white"
              >
                Browse marketplace
              </Link>
              <Link
                href="/api/x402/weather"
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg font-mono transition-colors text-white"
              >
                Try the paid API
              </Link>
            </div>
          </div>
        </section>

        {/* Commerce skills grid */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold mb-2 text-center">The flagship commerce skills</h2>
          <p className="text-center text-gray-500 mb-10 font-mono text-sm">
            the seven skills that power the agent-to-agent economy
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {commerceSkills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-mono font-semibold text-blue-700 mb-2">{skill.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{skill.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200">
        Built for the Pharos Skill-to-Agent Dual Cascade Hackathon. Payment rails vendored from the{" "}
        <a
          href="https://github.com/coinbase/x402"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          x402
        </a>{" "}
        Next.js example.
      </footer>
    </div>
  );
}
