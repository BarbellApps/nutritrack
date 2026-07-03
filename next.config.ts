import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photo-scan uploads a compressed JPEG as base64 (~33% overhead) —
      // default 1MB is well under a real phone photo even after compression.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
