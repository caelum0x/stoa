import { NextResponse } from "next/server";
import { getSkillCount, PHAROS } from "@/lib/stoa";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    network: "pharos-atlantic",
    chainId: PHAROS.chainId,
    rpcUrl: PHAROS.rpcUrl,
    skills: getSkillCount(),
    ts: new Date().toISOString(),
  });
}
