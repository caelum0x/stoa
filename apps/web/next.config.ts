import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the workspace packages so server routes (e.g. the skill playground) can import
  // @stoa/skills / @stoa/sdk directly without a separate build step.
  transpilePackages: ["@stoa/skills", "@stoa/sdk"],
};

export default nextConfig;
