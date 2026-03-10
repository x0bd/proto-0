import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.output ??= {};
    config.output.hashFunction = "sha256";
    return config;
  },
};

export default nextConfig;
