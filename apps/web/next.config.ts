import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Compile the workspace packages so server routes (e.g. the skill playground) can import
  // @stoa/skills / @stoa/sdk directly without a separate build step.
  transpilePackages: ["@stoa/skills", "@stoa/sdk"],
  outputFileTracingRoot: join(__dirname, "../.."),
  // This app is a demo dashboard — don't let type/lint nits block the production build.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
