import { Container, Card, Badge, EmptyState, SectionHeading } from "@/components/ui";
import { getCatalog, getSkillCount, getDomainCount } from "@/lib/stoa";

export const dynamic = "force-dynamic";

export default function SkillsPage() {
  const catalog = getCatalog();
  const total = getSkillCount();
  const domains = getDomainCount();

  return (
    <Container className="py-12">
      <SectionHeading
        title="Skill catalog"
        subtitle={`${total} skills across ${domains} domains, auto-generated from @stoa/skills`}
      />

      {catalog.length === 0 ? (
        <EmptyState
          title="No catalog available"
          hint="Build @stoa/skills with `pnpm build` to populate this page."
        />
      ) : (
        <div className="space-y-6">
          {catalog.map((domain) => (
            <Card key={domain.domain} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
                <h3 className="font-mono font-semibold capitalize text-zinc-100">{domain.domain}</h3>
                <Badge>
                  {domain.count} skill{domain.count === 1 ? "" : "s"}
                </Badge>
              </div>
              <div className="grid gap-px bg-white/5 sm:grid-cols-2">
                {domain.skills.map((skill) => (
                  <div key={skill.name} className="bg-[#0b0b12] px-5 py-3">
                    <div className="font-mono text-sm font-medium text-violet-300">{skill.name}</div>
                    <div className="mt-1 font-mono text-xs leading-relaxed text-zinc-400">
                      {skill.description || <span className="text-zinc-600">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
