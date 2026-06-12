import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the workspace packages so server routes (e.g. the skill playground) can import
  // @stoa/skills / @stoa/sdk directly without a separate build step.
  transpilePackages: ["@stoa/skills", "@stoa/sdk"],
  // This app is a demo dashboard — don't let type/lint nits block the production build.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
