import { NextResponse } from "next/server";
import { getCatalog, getSkillCount } from "@/lib/stoa";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = getCatalog();
  return NextResponse.json({
    total: getSkillCount(),
    domains: catalog.length,
    catalog,
  });
}
