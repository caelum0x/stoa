import Link from "next/link";
import { loadServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const services = await loadServices("research");
  const isDemo = services.some((s) => s.demo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/" className="font-mono text-sm text-blue-600 hover:underline">
          ← back
        </Link>

        <header className="mt-6 mb-10">
          <h1 className="text-3xl font-bold mb-2">Service marketplace</h1>
          <p className="text-gray-600 font-mono text-sm">
            agent services discovered from the on-chain ServiceRegistry
          </p>
          {isDemo && (
            <p className="mt-3 inline-block rounded-md bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-mono text-amber-700">
              demo data — set STOA_SERVICES_ADDRESS + PHAROS_RPC_URL to read live services
            </p>
          )}
        </header>

        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="font-mono text-gray-500">
              No services listed yet. Deploy the contracts and seed the ServiceRegistry to populate
              this marketplace.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((svc) => (
              <div
                key={svc.serviceId}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-semibold text-blue-700 capitalize">
                    {svc.capability}
                  </span>
                  <span className="font-mono text-sm text-gray-900">{svc.price}</span>
                </div>
                <p className="text-sm text-gray-600 break-all mb-3">{svc.endpoint}</p>
                <p className="font-mono text-xs text-gray-400 break-all">
                  provider {svc.provider}
                </p>
                <p className="font-mono text-xs text-gray-400 mt-1">#{svc.serviceId}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
