import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js 15 not to bundle these Node-only packages via webpack.
  // They are resolved at runtime by the Node.js require() system instead.
  // This is the correct fix for pdf-parse / mammoth in App Router routes.
  serverExternalPackages: ["pdf-parse", "mammoth"],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client bundle: polyfill missing Node built-ins as empty stubs.
      // This only affects the browser bundle — the server build is unaffected.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        zlib: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
