import Link from "next/link";
import { getCatalog, getSkillCount } from "@/lib/stoa";

export const dynamic = "force-dynamic";

export default function SkillsPage() {
  const catalog = getCatalog();
  const total = getSkillCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/" className="font-mono text-sm text-blue-600 hover:underline">
          ← back
        </Link>

        <header className="mt-6 mb-10">
          <h1 className="text-3xl font-bold mb-2">Skill catalog</h1>
          <p className="text-gray-600 font-mono text-sm">
            {total} skills across {catalog.length} domains, auto-generated from{" "}
            <span className="text-gray-900">@stoa/skills</span>.
          </p>
        </header>

        {catalog.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="font-mono text-gray-500">
              No catalog available. Build <span className="text-gray-900">@stoa/skills</span> with{" "}
              <code className="px-1 py-0.5 bg-gray-100 rounded">pnpm build</code> to populate this
              page.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {catalog.map((domain) => (
              <section
                key={domain.domain}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <h2 className="font-mono font-semibold capitalize">{domain.domain}</h2>
                  <span className="font-mono text-xs text-gray-500">
                    {domain.count} skill{domain.count === 1 ? "" : "s"}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {domain.skills.map((skill) => (
                      <tr key={skill.name} className="border-t border-gray-100 align-top">
                        <td className="px-5 py-2 font-mono text-blue-700 whitespace-nowrap w-1/3">
                          {skill.name}
                        </td>
                        <td className="px-5 py-2 text-gray-600">
                          {skill.description || <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
