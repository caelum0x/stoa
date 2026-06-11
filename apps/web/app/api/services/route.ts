import { NextRequest, NextResponse } from "next/server";
import { loadServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const capability = req.nextUrl.searchParams.get("capability") ?? "research";

  // loadServices never throws: it reads the on-chain ServiceRegistry when
  // STOA_SERVICES_ADDRESS + PHAROS_RPC_URL are configured, otherwise returns a
  // small demo dataset flagged with `demo: true`.
  const services = await loadServices(capability);

  return NextResponse.json({
    capability,
    count: services.length,
    services,
  });
}
