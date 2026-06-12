import { NextRequest, NextResponse } from "next/server";
import { isRunnable } from "@/lib/safe-skills";

export const dynamic = "force-dynamic";

// A throwaway dev key used only to construct a StoaAgent for stateless/pure skills (which ignore
// the agent entirely). Never used to sign or move funds. Overridable via STOA_PRIVATE_KEY.
const THROWAWAY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

/// POST /api/run/<SKILL> — execute a read-only/pure skill with the posted JSON input.
/// Only skills on the playground allowlist (no keys, no writes) are accepted.
export async function POST(req: NextRequest, ctx: { params: Promise<{ skill: string }> }) {
  const { skill } = await ctx.params;
  const name = (skill ?? "").toUpperCase();

  if (!isRunnable(name)) {
    return NextResponse.json(
      { status: "error", message: `Skill ${name} is not runnable here (write/keyed skills are disabled).` },
      { status: 400 },
    );
  }

  let input: unknown = {};
  try {
    input = await req.json();
  } catch {
    input = {};
  }

  try {
    // Dynamically import so a missing/unbuilt @stoa/skills returns a friendly error, not a crash.
    const skills = (await import("@stoa/skills")) as typeof import("@stoa/skills");
    const action = skills.actionsByName[name];
    if (!action) {
      return NextResponse.json({ status: "error", message: `Unknown skill ${name}` }, { status: 404 });
    }

    const parsed = action.schema.safeParse(input);
    if (!parsed.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid input", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const agent = new skills.StoaAgent({
      privateKey: (process.env.STOA_PRIVATE_KEY ?? THROWAWAY) as `0x${string}`,
      rpcUrl: process.env.PHAROS_RPC_URL,
    });
    const result = await action.handler(agent, parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      {
        status: "error",
        message: e instanceof Error ? e.message : String(e),
        hint: "Run `pnpm build` so @stoa/skills is available to the web app.",
      },
      { status: 500 },
    );
  }
}
