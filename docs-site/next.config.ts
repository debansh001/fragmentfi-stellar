import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly set the Turbopack workspace root to THIS directory.
  // Without this, Turbopack auto-detects the workspace root as the
  // parent monorepo directory (fragmentfi-stellar/) and tries to
  // compile proxy.ts, which doesn't have 'jose' in THIS package.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
