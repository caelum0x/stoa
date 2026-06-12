import { NextResponse } from "next/server";
import { getRunnableSkills } from "@/lib/safe-skills";

export const dynamic = "force-dynamic";

/// GET /api/run — list the skills runnable in the playground (pure + read-only).
export async function GET() {
  const skills = getRunnableSkills();
  return NextResponse.json({ count: skills.length, skills });
}
