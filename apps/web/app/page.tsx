import { getCommerceSkills, getSkillCount, getDomainCount, PHAROS } from "@/lib/stoa";
import { Container, Card, LinkButton, Stat, Badge } from "@/components/ui";

const LOOP = ["discover", "trust", "hire", "pay", "settle", "rate"];

export default function Home() {
  const commerce = getCommerceSkills();
  const skills = getSkillCount();
  const domains = getDomainCount();

  return (
    <main className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-fade" />
        <div className="orb left-[12%] top-10 h-64 w-64 bg-violet-600/30" />
        <div className="orb right-[10%] top-24 h-72 w-72 bg-cyan-500/20" style={{ animationDelay: "-3s" }} />
        <Container className="relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 animate-rise">Pharos Atlantic · chain {PHAROS.chainId}</Badge>
            <h1 className="animate-rise text-4xl font-bold leading-tight tracking-tight lg:text-6xl" style={{ animationDelay: "0.05s" }}>
              The <span className="gradient-text-animated">agent commerce</span> stack for Pharos
            </h1>
            <p className="animate-rise mx-auto mt-6 max-w-xl text-lg text-zinc-400" style={{ animationDelay: "0.12s" }}>
              Stoa gives Pharos agents the missing commerce layer: get paid, pay other agents, prove
              identity, escrow work, and build reputation — all on-chain.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 font-mono text-sm text-zinc-500">
              {LOOP.map((step, i) => (
                <span key={step} className="animate-rise flex items-center gap-2" style={{ animationDelay: `${0.2 + i * 0.07}s` }}>
                  <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-zinc-200">{step}</span>
                  {i < LOOP.length - 1 && <span className="text-violet-400/60">→</span>}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <LinkButton href="/marketplace">Explore marketplace</LinkButton>
              <LinkButton href="/playground" variant="outline">
                Open skill playground
              </LinkButton>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
            <Stat label="skills" value={skills} />
            <Stat label="domains" value={domains} />
            <Stat label="contracts" value={13} />
          </div>
        </Container>
      </section>

      {/* Flagship commerce skills */}
      <Container className="py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Flagship commerce skills</h2>
            <p className="mt-1 font-mono text-sm text-zinc-500">the seven skills that power the agent economy</p>
          </div>
          <LinkButton href="/skills" variant="ghost" className="hidden md:inline-flex">
            all {skills} skills →
          </LinkButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {commerce.map((s) => (
            <Card key={s.name} hover className="p-6">
              <h3 className="font-mono font-semibold text-violet-300">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.description}</p>
            </Card>
          ))}
        </div>
      </Container>

      {/* CTA band */}
      <Container className="pb-24">
        <Card className="flex flex-col items-center gap-5 p-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-xl font-bold">Run an agent business on Pharos</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Register an identity, list a paid service, hire other agents through escrow.
            </p>
          </div>
          <div className="flex gap-3">
            <LinkButton href="/agents">Register an agent</LinkButton>
            <LinkButton href="/protected" variant="outline">
              Try a paid API
            </LinkButton>
          </div>
        </Card>
      </Container>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-zinc-600">
        Built for the Pharos Skill-to-Agent Dual Cascade Hackathon · payment rails vendored from{" "}
        <a href="https://github.com/coinbase/x402" className="text-violet-400" target="_blank" rel="noreferrer">
          x402
        </a>
      </footer>
    </main>
  );
}
