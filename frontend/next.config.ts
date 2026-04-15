import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  output: "standalone",
};

export default nextConfig;
